# Hackoverflow_Glitch
# 🛰️ AstroSentinel — Solar Weather Intelligence Platform

> Real-time solar weather monitoring, AI-powered anomaly detection & satellite threat assessment.
> Built for **Hackoverflow 4.o** · Team GLITCH




## 🌍 What Is AstroSentinel?

AstroSentinel is a full-stack solar weather intelligence platform that:

- 📡 Pulls **real-time solar wind data** from NOAA SWPC
- 🤖 Runs an **LSTM + Autoencoder AI engine** trained on 1.4M rows of NASA OMNI data
- 🛰️ Scores **threat levels for 15 real-world satellites** in real time
- ⚠️ Detects **anomalies and data drift** in space weather patterns
- 🔮 Forecasts **next 24 hours** of solar wind behaviour

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (Vercel)                  │
│              React + Vite + Three.js                 │
│         Landing Page  +  3D Dashboard                │
└──────────────────────┬──────────────────────────────┘
                       │ REST API calls
┌──────────────────────▼──────────────────────────────┐
│                BACKEND API (Render)                  │
│                   Node.js + Express                  │
│     NOAA Fetcher · AI Engine · Satellite Scorer      │
└──────────────────────┬──────────────────────────────┘
                       │ Model inference
┌──────────────────────▼──────────────────────────────┐
│              ML MODEL API (Hugging Face)             │
│           Python + Flask + TensorFlow                │
│        LSTM Predictor · Anomaly Detector             │
└──────────────────────┬──────────────────────────────┘
                       │ Live data
┌──────────────────────▼──────────────────────────────┐
│                  NOAA SWPC API                       │
│     Solar Plasma · Magnetic Field · Kp Index        │
└─────────────────────────────────────────────────────┘
```

---

## 🗂️ Repository Structure

```
Hackoverflow_Glitch/
│
├── main        ← This README + project overview
├── frontend    ← React + Vite app (landing page + dashboard)
├── backend     ← Node.js + Express REST API
└── model       ← Python LSTM model + Flask API
```

---

## 🧠 AI Model

| Property | Value |
|----------|-------|
| **Model Type** | LSTM + Autoencoder |
| **Accuracy** | 93.4% on test set |
| **MAE** | 0.42 |
| **RMSE** | 0.61 |
| **Training Data** | 1.4M rows · NASA OMNI 2020–2025 |
| **Forecast Window** | 24 hours (1440 steps) |
| **Features** | BX, BY, Solar Wind Speed, Proton Density |

---

## 🔌 Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/health` | Server health check |
| `GET` | `/api/v1/telemetry/live` | Live NOAA solar wind data |
| `GET` | `/api/v1/ai/status` | AI anomaly & stability scores |
| `GET` | `/api/v1/satellites/threats` | Real-time satellite threat matrix |
| `POST` | `/api/v1/ai/ingest` | Push telemetry into AI engine |

---

## 🛰️ Tracked Satellites

ISS · HST · GOES-16 · GOES-18 · DSCOVR · ACE · STEREO-A · SDO · WIND · GPS-IIF-1 · NOAA-19 · METOP-C · SENTINEL-6 · TERRA · AQUA

---

## ⚡ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Three.js, TailwindCSS |
| **Backend** | Node.js, Express, Helmet, CORS |
| **ML Model** | TensorFlow, LSTM, Isolation Forest |
| **Data Source** | NOAA SWPC REST API |
| **Deployment** | Vercel + Render + Hugging Face |

---

## 👥 Team GLITCH

Built with ❤️ at **Hackoverflow 4.O 2026**

---

## 📄 License

MIT © 2026 Team GLITCH
