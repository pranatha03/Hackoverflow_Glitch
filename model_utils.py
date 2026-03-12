# model_utils.py

import numpy as np
import joblib
from tf_keras.models import load_model

SEQUENCE_LEN = 60
FEATURE_COUNT = 4

# Load model once
model = load_model("lstm_model.keras")

# Load scaler
scaler = joblib.load("scaler.pkl")

def predict_solar_wind(sequence_data):
    """
    sequence_data shape must be (60, 4)
    """

    if len(sequence_data) != SEQUENCE_LEN:
        raise ValueError("Sequence must be 60 timesteps")

    arr = np.array(sequence_data)

    if arr.shape[1] != FEATURE_COUNT:
        raise ValueError("Each timestep must have 4 features")

    # scale input
    scaled = scaler.transform(arr)

    # reshape for LSTM
    scaled = scaled.reshape(1, SEQUENCE_LEN, FEATURE_COUNT)

    prediction = model.predict(scaled, verbose=0)


    return float(prediction[0][0])
