"""
=============================================================
 ASTRO SENTINEL — Enhanced Model Pipeline v2
 Datasets: NASA OMNI 2017-18, 2020-21, 2024-25
 Total: ~1.6 million rows of real solar wind data
 Predicts: Next 24-48 hours of solar wind behaviour
=============================================================
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import warnings
warnings.filterwarnings("ignore")

from sklearn.preprocessing import MinMaxScaler
from sklearn.ensemble import IsolationForest
from scipy.stats import ks_2samp

import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping

# ══════════════════════════════════════════════════════════
#  CONFIG
# ══════════════════════════════════════════════════════════
FILES = [
    {"path": "omni_min__fXgnOKPV0_lst.txt", "has_bz": False},  # 2017-18
    {"path": "20_21datalst.txt",             "has_bz": True},   # 2020-21
    {"path": "24_25data.lst",                "has_bz": True},   # 2024-25
    {"path": "25_26data.lst",                "has_bz": True},   # 2025-26
]

FEATURES     = ["BX", "BY", "solar_wind_speed", "proton_density"]
TARGET_IDX   = FEATURES.index("solar_wind_speed")
SEQUENCE_LEN = 60       # 60 mins lookback
FORECAST_STEPS = 1440   # predict 24 hours ahead (1440 minutes)
EPOCHS       = 20
BATCH_SIZE   = 128
TRAIN_SAMPLE = 150000   # rows to train on (covers ~100 days)
ANOMALY_CONTAMINATION = 0.05
DRIFT_WINDOW = 1000


# ══════════════════════════════════════════════════════════
#  STEP 1: LOAD & COMBINE ALL DATASETS
# ══════════════════════════════════════════════════════════
def load_file(path, has_bz=False):
    if has_bz:
        cols = ["year","doy","hour","minute","BX","BY","BZ","solar_wind_speed","proton_density"]
    else:
        cols = ["year","doy","hour","minute","BX","BY","solar_wind_speed","proton_density"]

    df = pd.read_csv(path, sep=r'\s+', header=None, names=cols)
    df["timestamp"] = pd.to_datetime(
        df["year"].astype(str) + " " + df["doy"].astype(str) + " " +
        df["hour"].astype(str) + " " + df["minute"].astype(str),
        format="%Y %j %H %M"
    )
    df = df.drop(columns=["year","doy","hour","minute"])
    if has_bz:
        df = df.drop(columns=["BZ"])

    # Replace NASA missing-value codes
    df["BX"]               = df["BX"].replace(9999.99, np.nan)
    df["BY"]               = df["BY"].replace(9999.99, np.nan)
    df["solar_wind_speed"] = df["solar_wind_speed"].replace(99999.9, np.nan)
    df["proton_density"]   = df["proton_density"].replace(999.99, np.nan)
    df = df.ffill().bfill()
    return df


def load_all(files):
    print("\n[1/4] Loading and combining all datasets...")
    dfs = []
    for f in files:
        try:
            df = load_file(f["path"], f["has_bz"])
            print(f"      {f['path']:35s} → {len(df):>8,} rows | {df['timestamp'].min().year}-{df['timestamp'].max().year}")
            dfs.append(df)
        except FileNotFoundError:
            print(f"      SKIPPED (not found): {f['path']}")

    combined = pd.concat(dfs).sort_values("timestamp").reset_index(drop=True)
    print(f"\n      TOTAL: {len(combined):,} rows | {combined['timestamp'].min()} → {combined['timestamp'].max()}")
    return combined


# ══════════════════════════════════════════════════════════
#  STEP 2: SCALE
# ══════════════════════════════════════════════════════════
def scale_data(df):
    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(df[FEATURES])
    return scaled, scaler


# ══════════════════════════════════════════════════════════
#  STEP 3: LSTM — Train on combined data
# ══════════════════════════════════════════════════════════
def make_sequences(scaled, seq_len=SEQUENCE_LEN):
    X, y = [], []
    for i in range(len(scaled) - seq_len):
        X.append(scaled[i : i + seq_len])
        y.append(scaled[i + seq_len][TARGET_IDX])
    return np.array(X), np.array(y)


def build_lstm(input_shape):
    model = Sequential([
        LSTM(128, return_sequences=True, input_shape=input_shape),
        Dropout(0.2),
        LSTM(64, return_sequences=True),
        Dropout(0.2),
        LSTM(32),
        Dropout(0.2),
        Dense(32, activation="relu"),
        Dense(1)
    ])
    model.compile(optimizer="adam", loss="mse")
    return model


def train_lstm(scaled):
    print(f"\n[2/4] Training LSTM on {TRAIN_SAMPLE:,} samples...")

    # Sample evenly from the full dataset for diversity
    indices = np.linspace(0, len(scaled) - SEQUENCE_LEN - 1, TRAIN_SAMPLE, dtype=int)
    sample  = scaled[indices[0] : indices[-1] + SEQUENCE_LEN + 1]

    X, y = make_sequences(sample)
    split    = int(len(X) * 0.9)
    X_train, X_val = X[:split], X[split:]
    y_train, y_val = y[:split], y[split:]

    print(f"      Train: {len(X_train):,} sequences | Val: {len(X_val):,} sequences")

    model = build_lstm((X_train.shape[1], X_train.shape[2]))
    es = EarlyStopping(monitor="val_loss", patience=4, restore_best_weights=True)

    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        callbacks=[es],
        verbose=1
    )
    print("      LSTM training complete!")
    return model, history, X_val, y_val


# ══════════════════════════════════════════════════════════
#  STEP 4: 24-HOUR FORECAST
# ══════════════════════════════════════════════════════════
def forecast_24h(model, scaled, scaler):
    print(f"\n      Generating {FORECAST_STEPS}-step (24hr) forecast...")

    # Start from the last 60 points of our data
    seed_seq = scaled[-SEQUENCE_LEN:].copy()
    predictions = []

    current_seq = seed_seq.copy()
    for _ in range(FORECAST_STEPS):
        X = np.expand_dims(current_seq, axis=0)
        pred = model.predict(X, verbose=0)[0][0]
        predictions.append(pred)

        # Slide window: drop oldest, add new prediction
        new_row = current_seq[-1].copy()
        new_row[TARGET_IDX] = pred
        current_seq = np.vstack([current_seq[1:], new_row])

    return np.array(predictions)


# ══════════════════════════════════════════════════════════
#  STEP 5: ANOMALY DETECTION
# ══════════════════════════════════════════════════════════
def detect_anomalies(scaled):
    print("\n[3/4] Running anomaly detection...")
    sample = scaled[:100000]
    iso    = IsolationForest(contamination=ANOMALY_CONTAMINATION, random_state=42, n_estimators=100)
    preds  = iso.fit_predict(sample)
    mask   = preds == -1
    print(f"      Found {mask.sum():,} anomalies in {len(sample):,} points ({mask.mean()*100:.1f}%)")
    return mask


# ══════════════════════════════════════════════════════════
#  STEP 6: DRIFT DETECTION
# ══════════════════════════════════════════════════════════
def detect_drift(scaled):
    print("\n[4/4] Running drift detection (2017 vs 2024-25 data)...")
    results = {}
    for i, col in enumerate(FEATURES):
        early  = scaled[:DRIFT_WINDOW, i]
        recent = scaled[-DRIFT_WINDOW:, i]
        stat, p = ks_2samp(early, recent)
        drifted = p < 0.05
        results[col] = {"ks_stat": round(float(stat),4), "p_value": round(float(p),4), "drift_detected": drifted}
        status = "DRIFT DETECTED ⚠️" if drifted else "Stable ✅"
        print(f"      {col:22s} | KS={stat:.4f} | p={p:.6f} | {status}")
    return results


# ══════════════════════════════════════════════════════════
#  VISUALIZE
# ══════════════════════════════════════════════════════════
def plot_results(scaled, anomaly_mask, model, history, X_val, y_val, forecast):
    fig, axes = plt.subplots(4, 1, figsize=(16, 16))
    fig.suptitle("ASTRO SENTINEL — NASA OMNI AI Results (2017–2025)", fontsize=15, fontweight="bold")

    # Plot 1: LSTM predictions vs actual
    y_pred = model.predict(X_val[:500], verbose=0).flatten()
    axes[0].plot(y_val[:500],  label="Actual",    alpha=0.8)
    axes[0].plot(y_pred[:500], label="Predicted", alpha=0.7, linestyle="--")
    axes[0].set_title("LSTM: Solar Wind Speed — Actual vs Predicted (validation set)")
    axes[0].legend(); axes[0].set_ylabel("Scaled Speed")

    # Plot 2: 24-hour forecast
    axes[1].plot(forecast, color="orange", linewidth=1.5, label="24hr Forecast")
    axes[1].axvline(x=0, color="red", linestyle="--", alpha=0.5, label="Now")
    axes[1].set_title("24-Hour Solar Wind Speed Forecast")
    axes[1].set_xlabel("Minutes into future"); axes[1].set_ylabel("Scaled Speed")
    axes[1].legend()

    # Plot 3: Anomalies
    signal = scaled[:100000, TARGET_IDX]
    axes[2].plot(signal, alpha=0.5, linewidth=0.4, label="Solar Wind Speed")
    axes[2].scatter(
        np.where(anomaly_mask)[0], signal[anomaly_mask],
        color="red", s=3, label="Anomaly", zorder=5
    )
    axes[2].set_title("Anomaly Detection across 2017-2025 data")
    axes[2].legend(); axes[2].set_ylabel("Scaled Value")

    # Plot 4: Training loss
    axes[3].plot(history.history["loss"],     label="Train Loss")
    axes[3].plot(history.history["val_loss"], label="Val Loss", linestyle="--")
    axes[3].set_title("LSTM Training Loss")
    axes[3].set_xlabel("Epoch"); axes[3].set_ylabel("MSE")
    axes[3].legend()

    plt.tight_layout()
    plt.savefig("model_results_v2.png", dpi=150)
    print("\n   Saved: model_results_v2.png")
    plt.show()


# ══════════════════════════════════════════════════════════
#  MAIN
# ══════════════════════════════════════════════════════════
def main():
    print("=" * 60)
    print("  ASTRO SENTINEL — ENHANCED MODEL PIPELINE v2")
    print("  NASA OMNI Data: 2017-18 | 2020-21 | 2024-25")
    print("=" * 60)

    df             = load_all(FILES)
    scaled, scaler = scale_data(df)

    model, history, X_val, y_val = train_lstm(scaled)

    forecast     = forecast_24h(model, scaled, scaler)
    anomaly_mask = detect_anomalies(scaled)
    drift_results = detect_drift(scaled)

    plot_results(scaled, anomaly_mask, model, history, X_val, y_val, forecast)

    model.save("lstm_model.keras")
    print("   Saved: lstm_model.keras")

    print("\n" + "=" * 60)
    print("  FINAL SUMMARY")
    print("=" * 60)
    print(f"  Total data points trained on : {len(df):,}")
    print(f"  Date range                   : {df['timestamp'].min().date()} to {df['timestamp'].max().date()}")
    print(f"  Forecast window              : 24 hours ({FORECAST_STEPS} steps)")
    print(f"  Anomalies detected           : {anomaly_mask.sum():,}")
    print()
    for col, r in drift_results.items():
        status = "DRIFTED" if r["drift_detected"] else "Stable"
        print(f"  {col:22s} → {status} (p={r['p_value']})")

    print("\n  Pipeline complete!")


if __name__ == "__main__":
    main()
