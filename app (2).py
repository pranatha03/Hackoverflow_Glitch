"""
ASTRO SENTINEL — Flask API
No TensorFlow — lightweight deployment
Endpoints:
  GET  /health          → check if API is running
  POST /anomaly         → detect anomalies in given data
  POST /drift           → get drift detection results
  GET  /forecast        → returns pre-computed 24hr forecast
"""

from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
import joblib
import logging
import os
import base64
import io
from sklearn.ensemble import IsolationForest
from scipy.stats import ks_2samp

app = Flask(__name__)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("astro_sentinel_ai")

FEATURES     = ["BX", "BY", "solar_wind_speed", "proton_density"]
DRIFT_WINDOW = 500

# Scaler embedded as base64 (avoids binary file in repo)
_SCALER_B64 = (
    "gASVXAEAAAAAAACMG3NrbGVhcm4ucHJlcHJvY2Vzc2luZy5fZGF0YZSMDE1pbk1heFNjYWxlcpSTlCmBlH2UKIwNZmVhdHVyZV9yYW5nZZRL"
    "AEsBhpSMBGNvcHmUiIwEY2xpcJSJjA5uX2ZlYXR1cmVzX2luX5RLBIwPbl9zYW1wbGVzX3NlZW5flEsCjAZzY2FsZV+UjBNqb2JsaWIubn"
    "VtcHlfcGlja2xllIwRTnVtcHlBcnJheVdyYXBwZXKUk5QpgZR9lCiMCHN1YmNsYXNzlIwFbnVtcHmUjAduZGFycmF5lJOUjAVzaGFwZZRL"
    "BIWUjAVvcmRlcpSMAUOUjAVkdHlwZZRoEowFZHR5cGWUk5SMAmY4lImIh5RSlChLA4wBPJROTk5K/////0r/////SwB0lGKMCmFsbG93X21t"
    "YXCUiIwbbnVtcHlfYXJyYXlfYWxpZ25tZW50X2J5dGVzlEsQdWII//////////97FK5H4XqEP3sUrkfheoQ/sak05NxnVz8CSAHNIICEP5Uq"
    "AAAAAAAAAIwEbWluX5RoDimBlH2UKGgRaBRoFUsEhZRoF2gYaBloHmghiGgiSxB1Ygz///////////////8AAAAAAADgPwAAAAAAAOA/kiRJkiRJ"
    "0r9oBgGkgGZQv5UvAAAAAAAAAIwJZGF0YV9taW5flGgOKYGUfZQoaBFoFGgVSwSFlGgXaBhoGWgeaCGIaCJLEHViB/////////8AAAAAAABJwA"
    "AAAAAAAEnAAAAAAAAAaUCamZmZmZm5P5UvAAAAAAAAAIwJZGF0YV9tYXhflGgOKYGUfZQoaBFoFGgVSwSFlGgXaBhoGWgeaCGIaCJLEHViB/"
    "////////8AAAAAAABJQAAAAAAAAElAAAAAAAAgjEAAAAAAAABZQJUxAAAAAAAAAIwLZGF0YV9yYW5nZV+UaA4pgZR9lChoEWgUaBVLBIWUaBdo"
    "GGgZaB5oIYhoIksQdWIF//////8AAAAAAABZQAAAAAAAAFlAAAAAAADghUCamZmZmflYQJUeAAAAAAAAAIwQX3NrbGVhcm5fdmVyc2lvbpSMBTE"
    "uNi4xlHViLg=="
)

logger.info("Loading scaler from embedded data...")
scaler = joblib.load(io.BytesIO(base64.b64decode(_SCALER_B64)))
logger.info("Scaler loaded!")


def preprocess_input_data(data_list):
    df = pd.DataFrame(data_list)
    df = df[FEATURES].replace({
        9999.99: np.nan,
        99999.9: np.nan,
        999.99: np.nan
    }).ffill().bfill()
    scaled = scaler.transform(df)
    return scaled


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "message": "ASTRO SENTINEL AI Engine running"})


@app.route("/anomaly", methods=["POST"])
def detect_anomaly_events():
    try:
        body = request.get_json()
        if not body or "data" not in body:
            return jsonify({"error": "Missing 'data' field"}), 400

        data   = body["data"]
        scaled = preprocess_input_data(data)

        iso   = IsolationForest(contamination=0.05, random_state=42, n_estimators=100)
        preds = iso.fit_predict(scaled)
        anomaly_indices = np.where(preds == -1)[0].tolist()

        return jsonify({
            "total_points": len(data),
            "anomaly_count": len(anomaly_indices),
            "anomaly_indices": anomaly_indices
        })

    except Exception as e:
        logger.error(f"Anomaly detection error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/drift", methods=["POST"])
def analyze_distribution_shift():
    try:
        body = request.get_json()
        if not body or "data" not in body:
            return jsonify({"error": "Missing 'data' field"}), 400

        data = body["data"]
        if len(data) < DRIFT_WINDOW * 2:
            return jsonify({"error": f"Need at least {DRIFT_WINDOW * 2} data points"}), 400

        scaled  = preprocess_input_data(data)
        results = {}

        for i, feature in enumerate(FEATURES):
            early  = scaled[:DRIFT_WINDOW, i]
            recent = scaled[-DRIFT_WINDOW:, i]
            stat, p_value = ks_2samp(early, recent)
            results[feature] = {
                "ks_statistic": round(float(stat), 4),
                "p_value": round(float(p_value), 4),
                "drift_detected": bool(p_value < 0.05)
            }

        return jsonify({"drift_analysis": results})

    except Exception as e:
        logger.error(f"Drift detection error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/forecast", methods=["GET"])
def get_forecast():
    return jsonify({
        "forecast_window": "24 hours",
        "steps": 1440,
        "model": "LSTM trained on 1.4M NASA OMNI datapoints (2020-2025)",
        "status": "Solar wind expected to stabilize over next 24 hours",
        "drift_summary": {
            "BX": "DRIFTED",
            "BY": "DRIFTED",
            "solar_wind_speed": "DRIFTED",
            "proton_density": "DRIFTED"
        },
        "anomalies_detected": 5000,
        "data_range": "2020-01-01 to 2025-11-23"
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    logger.info("Starting ASTRO SENTINEL AI Engine...")
    app.run(host="0.0.0.0", port=port, debug=False)
