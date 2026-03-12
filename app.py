"""
=============================================================
 ASTRO SENTINEL — Model API Server
 Serves predictions from the trained LSTM model
 Endpoints:
   GET  /health
   POST /predict
   GET  /forecast
   POST /anomaly
=============================================================
"""

import os
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler
from scipy.stats import ks_2samp

app = Flask(__name__)
CORS(app)

# ─── Config ──────────────────────────────────────────────
MODEL_PATH   = os.environ.get("MODEL_PATH", "lstm_model.keras")
FEATURES     = ["BX", "BY", "solar_wind_speed", "proton_density"]
TARGET_IDX   = FEATURES.index("solar_wind_speed")
SEQUENCE_LEN = 60
PORT         = int(os.environ.get("PORT", 5000))

# ─── Load model once at startup ──────────────────────────
print("[STARTUP] Loading LSTM model...")
try:
    model = tf.keras.models.load_model(MODEL_PATH)
    print(f"[STARTUP] Model loaded from {MODEL_PATH}")
except Exception as e:
    print(f"[STARTUP] WARNING: Could not load model: {e}")
    model = None

# Shared scaler — fit on dummy data at startup
# In production replace with a saved scaler (joblib)
scaler = MinMaxScaler()
dummy  = np.array([
    [-10, -10, 200, 1],
    [ 10,  10, 900, 30],
])
scaler.fit(dummy)


# ─── Helpers ─────────────────────────────────────────────

def validate_sequence(data):
    """Validate incoming telemetry sequence."""
    if not isinstance(data, list):
        return False, "data must be a list of objects"
    if len(data) < SEQUENCE_LEN:
        return False, f"Need at least {SEQUENCE_LEN} data points, got {len(data)}"
    for i, row in enumerate(data):
        for f in FEATURES:
            if f not in row:
                return False, f"Missing field '{f}' in row {i}"
    return True, None


def prepare_sequence(data):
    """Convert list of dicts to scaled numpy sequence."""
    arr = np.array([[row[f] for f in FEATURES] for row in data[-SEQUENCE_LEN:]])
    scaled = scaler.transform(arr)
    return scaled


# ═══════════════════════════════════════════════════════
#  ENDPOINTS
# ═══════════════════════════════════════════════════════

# ── GET /health ──────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    """Health check."""
    return jsonify({
        "status"      : "ok",
        "model_loaded": model is not None,
        "model_path"  : MODEL_PATH,
        "features"    : FEATURES,
        "sequence_len": SEQUENCE_LEN,
    })


# ── POST /predict ────────────────────────────────────────
@app.route("/predict", methods=["POST"])
def predict():
    """
    Predict the next solar wind speed value.

    Body (JSON):
    {
      "data": [
        { "BX": -2.1, "BY": 3.4, "solar_wind_speed": 450.0, "proton_density": 8.2 },
        ... (at least 60 rows)
      ]
    }

    Response:
    {
      "predicted_solar_wind_speed": 462.3,
      "scaled_prediction": 0.32,
      "confidence": "high"
    }
    """
    if model is None:
        return jsonify({"error": "Model not loaded"}), 503

    body = request.get_json()
    if not body or "data" not in body:
        return jsonify({"error": "Send JSON body with 'data' array"}), 400

    valid, err = validate_sequence(body["data"])
    if not valid:
        return jsonify({"error": err}), 400

    try:
        seq        = prepare_sequence(body["data"])
        X          = np.expand_dims(seq, axis=0)
        scaled_pred = float(model.predict(X, verbose=0)[0][0])

        # Inverse scale the prediction
        dummy_row              = np.zeros((1, len(FEATURES)))
        dummy_row[0, TARGET_IDX] = scaled_pred
        inv                    = scaler.inverse_transform(dummy_row)
        real_speed             = float(inv[0, TARGET_IDX])

        confidence = "high" if 0.1 < scaled_pred < 0.9 else "low"

        return jsonify({
            "predicted_solar_wind_speed": round(real_speed, 2),
            "scaled_prediction"         : round(scaled_pred, 4),
            "confidence"                : confidence,
            "unit"                      : "km/s",
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── GET /forecast ────────────────────────────────────────
@app.route("/forecast", methods=["POST"])
def forecast():
    """
    Generate a multi-step solar wind speed forecast.

    Body (JSON):
    {
      "data": [ ...60+ telemetry rows... ],
      "steps": 60      (optional, default 60, max 1440)
    }

    Response:
    {
      "steps": 60,
      "forecast": [450.2, 451.1, ...],
      "unit": "km/s"
    }
    """
    if model is None:
        return jsonify({"error": "Model not loaded"}), 503

    body = request.get_json()
    if not body or "data" not in body:
        return jsonify({"error": "Send JSON body with 'data' array"}), 400

    valid, err = validate_sequence(body["data"])
    if not valid:
        return jsonify({"error": err}), 400

    steps = min(int(body.get("steps", 60)), 1440)

    try:
        seq         = prepare_sequence(body["data"])
        current_seq = seq.copy()
        predictions = []

        for _ in range(steps):
            X    = np.expand_dims(current_seq, axis=0)
            pred = float(model.predict(X, verbose=0)[0][0])
            predictions.append(pred)

            new_row              = current_seq[-1].copy()
            new_row[TARGET_IDX]  = pred
            current_seq          = np.vstack([current_seq[1:], new_row])

        # Inverse scale all predictions
        dummy_rows                    = np.zeros((len(predictions), len(FEATURES)))
        dummy_rows[:, TARGET_IDX]     = predictions
        inv                           = scaler.inverse_transform(dummy_rows)
        real_speeds                   = inv[:, TARGET_IDX].tolist()

        return jsonify({
            "steps"   : steps,
            "forecast": [round(v, 2) for v in real_speeds],
            "unit"    : "km/s",
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── POST /anomaly ────────────────────────────────────────
@app.route("/anomaly", methods=["POST"])
def anomaly():
    """
    Detect anomalies in a telemetry window using Z-score method.

    Body (JSON):
    {
      "data": [ ...telemetry rows... ]
    }

    Response:
    {
      "total_points": 100,
      "anomaly_count": 3,
      "anomaly_rate": 0.03,
      "anomaly_indices": [12, 45, 78]
    }
    """
    body = request.get_json()
    if not body or "data" not in body:
        return jsonify({"error": "Send JSON body with 'data' array"}), 400

    data = body["data"]
    if len(data) < 10:
        return jsonify({"error": "Need at least 10 data points"}), 400

    try:
        arr    = np.array([[row.get(f, 0) for f in FEATURES] for row in data])
        scaled = scaler.transform(arr)

        # Z-score anomaly detection
        mean   = scaled.mean(axis=0)
        std    = scaled.std(axis=0) + 1e-8
        z      = np.abs((scaled - mean) / std)
        flags  = (z > 3).any(axis=1)
        indices = np.where(flags)[0].tolist()

        return jsonify({
            "total_points"   : len(data),
            "anomaly_count"  : int(flags.sum()),
            "anomaly_rate"   : round(float(flags.mean()), 4),
            "anomaly_indices": indices,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── POST /drift ──────────────────────────────────────────
@app.route("/drift", methods=["POST"])
def drift():
    """
    Detect data drift between a baseline and current window.

    Body (JSON):
    {
      "baseline": [ ...telemetry rows... ],
      "current":  [ ...telemetry rows... ]
    }
    """
    body = request.get_json()
    if not body or "baseline" not in body or "current" not in body:
        return jsonify({"error": "Send 'baseline' and 'current' arrays"}), 400

    try:
        base = np.array([[r.get(f, 0) for f in FEATURES] for r in body["baseline"]])
        curr = np.array([[r.get(f, 0) for f in FEATURES] for r in body["current"]])

        base_s = scaler.transform(base)
        curr_s = scaler.transform(curr)

        results = {}
        for i, col in enumerate(FEATURES):
            stat, p   = ks_2samp(base_s[:, i], curr_s[:, i])
            results[col] = {
                "ks_stat"       : round(float(stat), 4),
                "p_value"       : round(float(p), 6),
                "drift_detected": bool(p < 0.05),
            }

        return jsonify({
            "features": results,
            "drift_detected_any": any(v["drift_detected"] for v in results.values()),
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─── Run ─────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=False)
