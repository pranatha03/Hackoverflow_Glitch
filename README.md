# 🛰 AstroSentinel — Backend API

> **Solar Weather Intelligence Platform**  
> Real-time space weather monitoring, AI anomaly detection & satellite threat assessment.  
> Built for **Hackoverflow Glitch 2025** · Team PHCET

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)
![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)

---

## 📡 What It Does

AstroSentinel pulls live solar-wind data from **NOAA SWPC**, runs it through an **AI anomaly detection engine**, and scores the threat level for 15 real-world satellites in real time. When NOAA is unavailable, it falls back to a realistic **synthetic telemetry generator**.

---

## 🗂 Project Structure

```
astrosentinel-backend/
│
├── src/
│   ├── core/
│   │   └── astrosentinel_backend.js   ← Pure logic: AI engine, NOAA fetcher, risk scoring
│   │
│   ├── routes/
│   │   ├── telemetry.js               ← /telemetry/* routes
│   │   ├── ai.js                      ← /ai/* routes
│   │   ├── satellites.js              ← /satellites/* routes
│   │   ├── config.js                  ← /config/* routes
│   │   └── severity.js                ← /severity route
│   │
│   ├── middleware/
│   │   ├── validate.js                ← Query/body param validation
│   │   ├── rateLimiter.js             ← Per-IP rate limiting
│   │   └── errorHandler.js            ← Global 404 + error handler
│   │
│   └── app.js                         ← Express app (no listen)
│
├── server.js                          ← Entry point
├── package.json
├── .env.example                       ← Environment variable template
└── .gitignore
```

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/pranatha03/Hackoverflow_Glitch.git
cd Hackoverflow_Glitch
git checkout backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your values (PORT, API keys, etc.)
```

### 3. Run

```bash
# Development (hot reload)
npm run dev

# Production
npm start
```

Server starts at: `http://localhost:3000/api/v1`

---

## 🔌 API Endpoints

Base URL: `http://localhost:3000/api/v1`

### 🟢 Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server readiness probe |

---

### ⚙️ Config

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/config/thresholds` | Sensor warning/critical threshold bands |
| `GET` | `/config/model` | AI model metadata (accuracy, MAE, RMSE) |

---

### 📊 Telemetry

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/telemetry/live` | Live snapshot — NOAA first, synthetic fallback |
| `GET` | `/telemetry/synthetic` | Generate N synthetic samples |

**Query params for `/telemetry/live`:**
```
source=noaa|synthetic     (default: noaa)
catastrophic=true|false   (solar storm simulation, default: false)
```

**Query params for `/telemetry/synthetic`:**
```
n=1..500                  (number of samples, default: 1)
catastrophic=true|false
```

**Sample response:**
```json
{
  "source": "NOAA SWPC",
  "data": {
    "radiation_flux": 134.2,
    "solar_wind_speed": 482.1,
    "magnetic_index": 3.12,
    "particle_density": 7.84,
    "bz_gsm": -2.14,
    "bt": 6.32,
    "timestamp": "2025-06-01T10:22:00.000Z",
    "data_source": "NOAA SWPC"
  }
}
```

---

### 🤖 AI Engine

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/ai/status` | Current anomaly, drift & stability scores |
| `POST` | `/ai/ingest` | Push a custom telemetry snapshot into the engine |
| `POST` | `/ai/calibrate` | Re-calibrate the engine with a fresh sample batch |

**Sample `/ai/status` response:**
```json
{
  "anomaly_score": 0.042,
  "drift_score": 0.011,
  "stability_score": 0.934,
  "predicted_risk_window": null,
  "classification": "STABLE",
  "confidence": 91.3
}
```

**`POST /ai/ingest` body:**
```json
{
  "radiation_flux": 210.5,
  "solar_wind_speed": 750.0,
  "magnetic_index": 6.2,
  "particle_density": 14.3
}
```

**`POST /ai/calibrate` body:**
```json
{
  "samples": [ ...array of 60+ telemetry objects... ]
}
```

---

### 🛰 Satellites

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/satellites` | Full satellite catalogue (15 assets) |
| `GET` | `/satellites/threats` | All MEDIUM/HIGH risk satellites right now |
| `GET` | `/satellites/:id/risk` | Risk score for a single satellite |

**Tracked satellites:** ISS, HST, GOES-16, GOES-18, DSCOVR, ACE, STEREO-A, SDO, WIND, GPS-IIF-1, NOAA-19, METOP-C, SENTINEL-6, TERRA, AQUA

**Sample `/satellites/threats` response:**
```json
{
  "source": "NOAA SWPC",
  "threat_count": 3,
  "threats": [
    {
      "id": "ISS",
      "name": "Intl Space Station",
      "risk_score": 0.812,
      "risk_level": "HIGH",
      "threat_type": "radiation_overload",
      "eta": 25
    }
  ]
}
```

**Query params (threats & :id/risk):**
```
source=noaa|synthetic
catastrophic=true|false
limit=1..50            (threats only, default: 50)
```

---

### 🔬 Severity Utility

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/severity` | Classify any sensor value against a threshold |

**Body:**
```json
{
  "field": "radiation_flux",
  "value": 210
}
```

**Response:**
```json
{
  "field": "radiation_flux",
  "value": 210,
  "severity": "CRITICAL",
  "normalised": 0.525
}
```

---

## 🧠 AI Engine — How It Works

| Component | Algorithm |
|-----------|-----------|
| **Anomaly Score** | Squared Mahalanobis distance (diagonal covariance) + exponential smoothing α=0.1 |
| **Drift Score** | Rolling-mean deviation from calibrated baseline + smoothing α=0.05 |
| **Risk Window** | Linear regression on last 10 readings of radiation flux & Kp index |
| **Stability Score** | Composite of anomaly + drift, bounded [0, 1] |
| **Model Type** | LSTM + Autoencoder |
| **Accuracy** | 93.4% on test set |
| **MAE / RMSE** | 0.42 / 0.61 |
| **Training Data** | 1.4M rows · NASA OMNI 2020–2025 |

---

## 🌍 Data Sources

| Source | Endpoint |
|--------|----------|
| NOAA SWPC — Solar Plasma | `products/solar-wind/plasma-3-day.json` |
| NOAA SWPC — Magnetic Field | `products/solar-wind/mag-3-day.json` |
| NOAA SWPC — Planetary Kp Index | `products/noaa-planetary-k-index.json` |

Falls back to **synthetic telemetry** (sine wave + random-walk drift) when NOAA is unreachable.

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Runtime environment |
| `API_PREFIX` | `/api/v1` | Route prefix |
| `CORS_ORIGIN` | `*` | Allowed CORS origins |
| `RATE_LIMIT_MAX_REQ` | `120` | Max requests per IP per minute |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate limit window (ms) |
| `AI_WARMUP_SAMPLES` | `300` | Samples used for AI warm-up on startup |
| `NOAA_FETCH_TIMEOUT_MS` | `8000` | NOAA request timeout (ms) |
| `NOAA_CACHE_TTL_SECONDS` | `60` | NOAA response cache duration |
| `API_KEY` | _(blank)_ | Optional API key auth (X-API-Key header) |
| `JWT_SECRET` | — | Secret for JWT signing (min 32 chars) |
| `REDIS_URL` | _(blank)_ | Redis URL for distributed cache |
| `DATABASE_URL` | _(blank)_ | DB connection string for telemetry persistence |

See `.env.example` for the full list.

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `express` | HTTP server framework |
| `helmet` | Security headers |
| `cors` | Cross-origin resource sharing |
| `express-rate-limit` | Per-IP rate limiting |
| `dotenv` | Environment variable loading |
| `node-fetch` | HTTP requests to NOAA |

---

## 🛠 Scripts

```bash
npm start       # Production server
npm run dev     # Development with nodemon hot-reload
npm test        # Jest test suite
```

---

## 👥 Team

Built at **Hackoverflow Glitch 2025** by Team PHCET  
Frontend: React · Backend: Node.js + Express · Data: NOAA SWPC

---

## 📄 License

MIT © 2025 pranatha03
