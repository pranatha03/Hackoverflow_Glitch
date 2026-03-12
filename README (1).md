# ASTRO SENTINEL — Backend

> AI-powered planetary environment monitoring backend.  
> Connects the trained LSTM model to the React frontend via Flask + Express APIs.

---

## Folder Structure

```
backend/
├── app.py              ← Flask API (AI model endpoints)
├── server.js           ← Express server (connects Flask to frontend)
├── package.json        ← Node dependencies
├── lstm_model.keras    ← Trained model (copy from model branch)
└── routes/
    └── aiRoutes.js     ← Express routes calling Flask
```

---

## Setup & Run

### 1. Flask API (Python)
```bash
pip install flask tensorflow scikit-learn scipy pandas numpy
python app.py
# Runs on http://localhost:5000
```

### 2. Express Server (Node)
```bash
npm install
node server.js
# Runs on http://localhost:3001
```

---

## API Endpoints

### Flask (port 5000) — AI Layer

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Check if API is running |
| POST | `/predict` | Predict next solar wind value |
| POST | `/anomaly` | Detect anomalies in data |
| POST | `/drift` | Detect long-term drift |

### Express (port 3001) — Frontend Layer

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/predict` | Predict (calls Flask) |
| POST | `/api/anomaly` | Anomaly detection (calls Flask) |
| POST | `/api/drift` | Drift detection (calls Flask) |

---

## Example API Calls

### Health Check
```bash
curl http://localhost:5000/health
```
Response:
```json
{ "status": "ok", "model": "lstm_model.keras" }
```

### Predict
```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"data": [{"BX": 7.2, "BY": -3.5, "solar_wind_speed": 547.8, "proton_density": 6.88}, ...]}'
```
Response:
```json
{ "predicted_solar_wind_speed_scaled": 0.63 }
```

### Anomaly Detection
```bash
curl -X POST http://localhost:5000/anomaly \
  -H "Content-Type: application/json" \
  -d '{"data": [...]}'
```
Response:
```json
{
  "total_points": 100,
  "anomaly_count": 5,
  "anomaly_indices": [12, 34, 56, 78, 90]
}
```

### Drift Detection
```bash
curl -X POST http://localhost:5000/drift \
  -H "Content-Type: application/json" \
  -d '{"data": [...]}'
```
Response:
```json
{
  "drift_results": {
    "BX":               { "ks_statistic": 0.984, "p_value": 0.0, "drift_detected": true },
    "BY":               { "ks_statistic": 0.622, "p_value": 0.0, "drift_detected": true },
    "solar_wind_speed": { "ks_statistic": 1.0,   "p_value": 0.0, "drift_detected": true },
    "proton_density":   { "ks_statistic": 1.0,   "p_value": 0.0, "drift_detected": true }
  }
}
```

---

## How It Connects to Frontend

```
Bhargav's React Dashboard
        ↓ fetch("/api/predict")
Express Server (port 3001)
        ↓ axios.post("/predict")
Flask API (port 5000)
        ↓ loads lstm_model.keras
    AI Prediction
```

The frontend calls Express, Express calls Flask, Flask runs the model and returns results.

---

## Important Notes

- Copy `lstm_model.keras` from the `model` branch into this folder before running
- Make sure Flask is running BEFORE starting Express
- Frontend should call Express (`port 3001`), never Flask directly

---

*Built by Nameeta & Pranatha | ASTRO SENTINEL Hackathon*
