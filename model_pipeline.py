"""
=============================================================
 Planetary Environment AI Model Pipeline
 Dataset: NASA OMNI Solar Wind Data (1-minute resolution)
 Columns: Year, DOY, Hour, Minute, BX, BY, Solar Wind Speed, Proton Density
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
DATA_PATH    = "omni_min__fXgnOKPV0_lst.txt"
SEQUENCE_LEN = 60       # look back 60 minutes
EPOCHS       = 20
BATCH_SIZE   = 64
ANOMALY_CONTAMINATION = 0.05
DRIFT_WINDOW = 500      # compare first 500 points vs last 500

# ══════════════════════════════════════════════════════════
#  STEP 1: LOAD & CLEAN NASA OMNI DATA
# ══════════════════════════════════════════════════════════
def load_omni(path):
    print("\n[1/4] Loading NASA OMNI data...")

    df = pd.read_csv(
        path,
        sep=r'\s+',
        header=None,
        names=["year", "doy", "hour", "minute", "BX", "BY", "solar_wind_speed", "proton_density"]
    )

    # Build proper timestamp from year + day-of-year + hour + minute
    df["timestamp"] = pd.to_datetime(
        df["year"].astype(str) + " " + df["doy"].astype(str) + " " +
        df["hour"].astype(str) + " " + df["minute"].astype(str),
        format="%Y %j %H %M"
    )
    df = df.drop(columns=["year", "doy", "hour", "minute"])
    df = df.sort_values("timestamp").reset_index(drop=True)

    # Replace NASA missing-value codes with NaN
    df["BX"]               = df["BX"].replace(9999.99, np.nan)
    df["BY"]               = df["BY"].replace(9999.99, np.nan)
    df["solar_wind_speed"] = df["solar_wind_speed"].replace(99999.9, np.nan)
    df["proton_density"]   = df["proton_density"].replace(999.99, np.nan)

    # Fill gaps with forward-fill then backward-fill (handles sparse deep-space data)
    df[["BX","BY","solar_wind_speed","proton_density"]] = (
        df[["BX","BY","solar_wind_speed","proton_density"]]
        .ffill()
        .bfill()
    )

    total   = len(df)
    missing = df[["BX","BY","solar_wind_speed","proton_density"]].isna().sum().sum()
    print(f"      Loaded {total:,} rows | Date range: {df['timestamp'].min()} to {df['timestamp'].max()}")
    print(f"      Missing values after fill: {missing}")
    return df

# ══════════════════════════════════════════════════════════
#  STEP 2: SCALE
# ══════════════════════════════════════════════════════════
FEATURES = ["BX", "BY", "solar_wind_speed", "proton_density"]

def scale_data(df):
    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(df[FEATURES])
    return scaled, scaler

# ══════════════════════════════════════════════════════════
#  STEP 3: LSTM — predict solar_wind_speed
# ══════════════════════════════════════════════════════════
TARGET_IDX = FEATURES.index("solar_wind_speed")

def make_sequences(scaled, seq_len=SEQUENCE_LEN):
    X, y = [], []
    for i in range(len(scaled) - seq_len):
        X.append(scaled[i : i + seq_len])
        y.append(scaled[i + seq_len][TARGET_IDX])
    return np.array(X), np.array(y)

def build_lstm(input_shape):
    model = Sequential([
        LSTM(64, return_sequences=True, input_shape=input_shape),
        Dropout(0.2),
        LSTM(32),
        Dropout(0.2),
        Dense(16, activation="relu"),
        Dense(1)
    ])
    model.compile(optimizer="adam", loss="mse")
    return model

def train_lstm(scaled):
    print("\n[2/4] Training LSTM...")

    # Use first 50,000 points for speed — still ~35 days of 1-min data
    sample = scaled[:50000]
    X, y = make_sequences(sample)

    split = int(len(X) * 0.9)
    X_train, X_val = X[:split], X[split:]
    y_train, y_val = y[:split], y[split:]

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
#  STEP 4: ANOMALY DETECTION
# ══════════════════════════════════════════════════════════
def detect_anomalies(scaled):
    print("\n[3/4] Running anomaly detection...")
    sample = scaled[:50000]
    iso = IsolationForest(contamination=ANOMALY_CONTAMINATION, random_state=42, n_estimators=100)
    preds = iso.fit_predict(sample)
    mask = preds == -1
    print(f"      Found {mask.sum():,} anomalies in {len(sample):,} points ({mask.mean()*100:.1f}%)")
    return mask

# ══════════════════════════════════════════════════════════
#  STEP 5: DRIFT DETECTION
# ══════════════════════════════════════════════════════════
def detect_drift(scaled):
    print("\n[4/4] Running drift detection (KS Test)...")
    results = {}
    for i, col in enumerate(FEATURES):
        early  = scaled[:DRIFT_WINDOW, i]
        recent = scaled[-DRIFT_WINDOW:, i]
        stat, p = ks_2samp(early, recent)
        drifted = p < 0.05
        results[col] = {"ks_stat": round(stat,4), "p_value": round(p,4), "drift_detected": drifted}
        status = "DRIFT DETECTED" if drifted else "Stable"
        print(f"      {col:20s} | KS={stat:.4f} | p={p:.4f} | {status}")
    return results

# ══════════════════════════════════════════════════════════
#  VISUALIZE
# ══════════════════════════════════════════════════════════
def plot_results(df, scaled, anomaly_mask, model, history, X_val, y_val):
    fig, axes = plt.subplots(3, 1, figsize=(15, 12))
    fig.suptitle("NASA OMNI — Planetary Environment AI Results", fontsize=15, fontweight="bold")

    # Plot 1: LSTM predictions vs actual
    y_pred = model.predict(X_val, verbose=0).flatten()
    axes[0].plot(y_val[:500],  label="Actual",    alpha=0.8)
    axes[0].plot(y_pred[:500], label="Predicted", alpha=0.7, linestyle="--")
    axes[0].set_title("LSTM: Solar Wind Speed — Actual vs Predicted (scaled, 500 validation points)")
    axes[0].legend(); axes[0].set_ylabel("Scaled Speed")

    # Plot 2: Solar wind speed with anomalies highlighted
    signal = scaled[:50000, TARGET_IDX]
    axes[1].plot(signal, alpha=0.6, linewidth=0.5, label="Solar Wind Speed")
    axes[1].scatter(
        np.where(anomaly_mask)[0], signal[anomaly_mask],
        color="red", s=5, label="Anomaly", zorder=5
    )
    axes[1].set_title("Anomaly Detection — Red dots = Anomalies")
    axes[1].legend(); axes[1].set_ylabel("Scaled Value")

    # Plot 3: Training loss
    axes[2].plot(history.history["loss"],     label="Train Loss")
    axes[2].plot(history.history["val_loss"], label="Val Loss", linestyle="--")
    axes[2].set_title("LSTM Training Loss per Epoch")
    axes[2].set_xlabel("Epoch"); axes[2].set_ylabel("MSE")
    axes[2].legend()

    plt.tight_layout()
    plt.savefig("model_results.png", dpi=150)
    print("\n   Saved: model_results.png")
    plt.show()

# ══════════════════════════════════════════════════════════
#  MAIN
# ══════════════════════════════════════════════════════════
def main():
    print("=" * 60)
    print("  PLANETARY ENVIRONMENT AI — NASA OMNI PIPELINE")
    print("=" * 60)

    df = load_omni(DATA_PATH)
    scaled, scaler = scale_data(df)

    model, history, X_val, y_val = train_lstm(scaled)
    anomaly_mask = detect_anomalies(scaled)
    drift_results = detect_drift(scaled)

    plot_results(df, scaled, anomaly_mask, model, history, X_val, y_val)

    model.save("lstm_model.keras")
    print("   Saved: lstm_model.keras")

    print("\n" + "=" * 60)
    print("  DRIFT SUMMARY")
    print("=" * 60)
    for col, r in drift_results.items():
        status = "DRIFTED" if r["drift_detected"] else "Stable"
        print(f"  {col:22s} -> {status}  (p={r['p_value']})")

    print("\n  Pipeline complete!")

if __name__ == "__main__":
    main()
