/**
 * AstroSentinel — REST API Server
 * Framework : Express.js
 * Run       : node server.js  (or  npm run dev  with nodemon)
 */

'use strict';

require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');

const {
  THRESH,
  severityLevel,
  scoreLevel,
  fetchNOAA,
  synth,
  makeAI,
  MODEL_METADATA,
  SATELLITES,
  riskScore,
  evaluateAllSatellites,
} = require('./astrosentinel_backend');

// ─── App setup ───────────────────────────────────────────────────────────────

const app  = express();
const PORT = process.env.PORT || 3000;
const API  = process.env.API_PREFIX || '/api/v1';

app.use(express.json());
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST'],
}));

// Global rate-limiter (per IP)
app.use(rateLimit({
  windowMs : parseInt(process.env.RATE_LIMIT_WINDOW_MS  || '60000'),   // 1 min
  max      : parseInt(process.env.RATE_LIMIT_MAX_REQ    || '120'),
  standardHeaders: true,
  legacyHeaders  : false,
  message: { error: 'Too many requests. Please slow down.' },
}));

// ─── Shared AI engine (singleton, warm-started) ──────────────────────────────

const ai = makeAI();
(function warmUp() {
  const warmupSize = parseInt(process.env.AI_WARMUP_SAMPLES || '300');
  const samples = Array.from({ length: warmupSize }, () => synth());
  ai.calibrate(samples);
  samples.forEach(d => ai.ingest(d));
  console.log(`[AI] Warm-up complete — ${warmupSize} samples ingested.`);
})();


// ─── Helpers ─────────────────────────────────────────────────────────────────

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function validate(schema, source = 'query') {
  return (req, res, next) => {
    for (const [key, rule] of Object.entries(schema)) {
      const raw = req[source][key];
      if (raw === undefined) {
        if (rule.required) return res.status(400).json({ error: `Missing required param: ${key}` });
        continue;
      }
      if (rule.type === 'boolean' && !['true','false','1','0'].includes(String(raw)))
        return res.status(400).json({ error: `Param '${key}' must be a boolean` });
      if (rule.type === 'int' && isNaN(parseInt(raw)))
        return res.status(400).json({ error: `Param '${key}' must be an integer` });
      if (rule.type === 'float' && isNaN(parseFloat(raw)))
        return res.status(400).json({ error: `Param '${key}' must be a number` });
    }
    next();
  };
}


// ═══════════════════════════════════════════════════════════════════════════
//  ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

// ── GET /api/v1/health ───────────────────────────────────────────────────────
/**
 * Health / readiness probe.
 * Response: { status, uptime_seconds, timestamp }
 */
app.get(`${API}/health`, (req, res) => {
  res.json({
    status          : 'ok',
    uptime_seconds  : Math.floor(process.uptime()),
    timestamp       : new Date().toISOString(),
    version         : process.env.npm_package_version || '1.0.0',
  });
});


// ── GET /api/v1/config/thresholds ────────────────────────────────────────────
/**
 * Returns the current sensor threshold configuration.
 * Response: { radiation_flux, solar_wind_speed, magnetic_index, particle_density }
 */
app.get(`${API}/config/thresholds`, (req, res) => {
  res.json(THRESH);
});


// ── GET /api/v1/config/model ─────────────────────────────────────────────────
/**
 * Returns AI model metadata (accuracy, MAE, RMSE, training info).
 * Response: MODEL_METADATA object
 */
app.get(`${API}/config/model`, (req, res) => {
  res.json(MODEL_METADATA);
});


// ── GET /api/v1/telemetry/live ───────────────────────────────────────────────
/**
 * Fetches a single live telemetry snapshot.
 * Tries NOAA SWPC first; falls back to synthetic if unavailable or
 * if ?source=synthetic is passed.
 *
 * Query params:
 *   source        string   "noaa" | "synthetic"  (default: "noaa")
 *   catastrophic  boolean  Amplify synthetic values (default: false)
 *
 * Response: telemetry snapshot + source label
 */
app.get(
  `${API}/telemetry/live`,
  validate({
    source       : { type: 'string' },
    catastrophic : { type: 'boolean' },
  }),
  asyncHandler(async (req, res) => {
    const forceSynth    = req.query.source === 'synthetic';
    const catastrophic  = ['true','1'].includes(String(req.query.catastrophic));

    let data   = null;
    let source = 'SYNTHETIC';

    if (!forceSynth) {
      data = await fetchNOAA();
      if (data) source = 'NOAA SWPC';
    }

    if (!data) {
      data   = synth(catastrophic);
      source = catastrophic ? 'SYNTHETIC (OMEGA)' : 'SYNTHETIC';
    }

    // Feed into AI engine
    ai.ingest(data);

    res.json({ source, data });
  })
);


// ── GET /api/v1/telemetry/synthetic ─────────────────────────────────────────
/**
 * Generates N synthetic telemetry samples in one call.
 * Useful for batch seeding / testing.
 *
 * Query params:
 *   n             int      Number of samples 1–500  (default: 1)
 *   catastrophic  boolean  Enable solar-storm mode  (default: false)
 *
 * Response: { count, samples: [...] }
 */
app.get(
  `${API}/telemetry/synthetic`,
  validate({
    n            : { type: 'int' },
    catastrophic : { type: 'boolean' },
  }),
  (req, res) => {
    const n            = Math.min(500, Math.max(1, parseInt(req.query.n || '1')));
    const catastrophic = ['true','1'].includes(String(req.query.catastrophic));

    const samples = Array.from({ length: n }, () => synth(catastrophic));
    res.json({ count: n, samples });
  }
);


// ── GET /api/v1/ai/status ────────────────────────────────────────────────────
/**
 * Returns the current AI engine assessment (anomaly, drift, stability, risk window).
 *
 * Response: {
 *   anomaly_score, drift_score, stability_score,
 *   predicted_risk_window, classification, confidence
 * }
 */
app.get(`${API}/ai/status`, (req, res) => {
  res.json(ai.status());
});


// ── POST /api/v1/ai/ingest ───────────────────────────────────────────────────
/**
 * Ingest a custom telemetry snapshot into the AI engine.
 * Useful when the client has its own data source.
 *
 * Body (JSON): telemetry snapshot (same schema as /telemetry/live response.data)
 *   Required fields: radiation_flux, solar_wind_speed, magnetic_index, particle_density
 *
 * Response: { ingested: true, ai_status: {...} }
 */
app.post(
  `${API}/ai/ingest`,
  asyncHandler(async (req, res) => {
    const d = req.body;
    const required = ['radiation_flux', 'solar_wind_speed', 'magnetic_index', 'particle_density'];
    for (const f of required) {
      if (d[f] == null || isNaN(parseFloat(d[f])))
        return res.status(400).json({ error: `Missing or invalid field: ${f}` });
    }
    ai.ingest(d);
    res.json({ ingested: true, ai_status: ai.status() });
  })
);


// ── POST /api/v1/ai/calibrate ────────────────────────────────────────────────
/**
 * Re-calibrates the AI engine with a fresh batch of samples.
 * Body (JSON): { samples: [ ...telemetry objects ] }   (min 60 required)
 *
 * Response: { calibrated: true, sample_count: N }
 */
app.post(
  `${API}/ai/calibrate`,
  asyncHandler(async (req, res) => {
    const { samples } = req.body;
    if (!Array.isArray(samples) || samples.length < 60)
      return res.status(400).json({ error: 'Provide at least 60 telemetry samples in body.samples[]' });

    ai.calibrate(samples);
    samples.forEach(d => ai.ingest(d));
    res.json({ calibrated: true, sample_count: samples.length });
  })
);


// ── GET /api/v1/satellites ───────────────────────────────────────────────────
/**
 * Returns the full satellite catalogue (static metadata only).
 * Response: { count, satellites: [...] }
 */
app.get(`${API}/satellites`, (req, res) => {
  res.json({ count: SATELLITES.length, satellites: SATELLITES });
});


// ── GET /api/v1/satellites/threats ──────────────────────────────────────────
/**
 * Evaluates all satellites against the current (or provided) telemetry
 * and returns MEDIUM/HIGH risk assets sorted by risk score.
 *
 * Query params:
 *   source        string   "noaa" | "synthetic"  (default: "noaa")
 *   catastrophic  boolean  Solar storm mode       (default: false)
 *   limit         int      Max results 1–50       (default: 50)
 *
 * Response: {
 *   source, telemetry, ai_status,
 *   threat_count, threats: [...]
 * }
 */
app.get(
  `${API}/satellites/threats`,
  validate({
    source       : { type: 'string' },
    catastrophic : { type: 'boolean' },
    limit        : { type: 'int' },
  }),
  asyncHandler(async (req, res) => {
    const forceSynth   = req.query.source === 'synthetic';
    const catastrophic = ['true','1'].includes(String(req.query.catastrophic));
    const limit        = Math.min(50, Math.max(1, parseInt(req.query.limit || '50')));

    let data   = null;
    let source = 'SYNTHETIC';

    if (!forceSynth) {
      data = await fetchNOAA();
      if (data) source = 'NOAA SWPC';
    }
    if (!data) {
      data   = synth(catastrophic);
      source = catastrophic ? 'SYNTHETIC (OMEGA)' : 'SYNTHETIC';
    }

    ai.ingest(data);
    const aiStatus = ai.status();
    const threats  = evaluateAllSatellites(data, aiStatus.predicted_risk_window, limit);

    res.json({
      source,
      telemetry    : data,
      ai_status    : aiStatus,
      threat_count : threats.length,
      threats,
    });
  })
);


// ── GET /api/v1/satellites/:id/risk ──────────────────────────────────────────
/**
 * Compute risk for a single satellite by ID against current or provided telemetry.
 *
 * Path param:  id   Satellite ID (e.g. ISS, HST, GOES-16)
 *
 * Query params:
 *   source        string   "noaa" | "synthetic"
 *   catastrophic  boolean
 *
 * Response: { source, telemetry, ai_status, risk } or 404 if unknown ID
 */
app.get(
  `${API}/satellites/:id/risk`,
  validate({
    source       : { type: 'string' },
    catastrophic : { type: 'boolean' },
  }),
  asyncHandler(async (req, res) => {
    const sat = SATELLITES.find(s => s.id.toUpperCase() === req.params.id.toUpperCase());
    if (!sat) return res.status(404).json({ error: `Unknown satellite ID: ${req.params.id}` });

    const forceSynth   = req.query.source === 'synthetic';
    const catastrophic = ['true','1'].includes(String(req.query.catastrophic));

    let data   = null;
    let source = 'SYNTHETIC';

    if (!forceSynth) {
      data = await fetchNOAA();
      if (data) source = 'NOAA SWPC';
    }
    if (!data) {
      data   = synth(catastrophic);
      source = catastrophic ? 'SYNTHETIC (OMEGA)' : 'SYNTHETIC';
    }

    ai.ingest(data);
    const aiStatus = ai.status();
    const risk     = riskScore(sat, data, aiStatus.predicted_risk_window);

    res.json({
      source,
      telemetry  : data,
      ai_status  : aiStatus,
      risk       : risk || { id: sat.id, name: sat.name, risk_level: 'LOW', risk_score: null },
    });
  })
);


// ── POST /api/v1/severity ────────────────────────────────────────────────────
/**
 * Utility: classify an arbitrary sensor value against a threshold band.
 *
 * Body (JSON): { field: "radiation_flux", value: 210 }
 *   field  — one of the keys in THRESH, OR pass a custom threshold object
 *   value  — numeric sensor reading
 *   thresh — (optional) custom { min, max, warn, crit } override
 *
 * Response: { field, value, severity, score_level }
 */
app.post(
  `${API}/severity`,
  asyncHandler(async (req, res) => {
    const { field, value, thresh: customThresh } = req.body;

    if (value == null || isNaN(parseFloat(value)))
      return res.status(400).json({ error: 'body.value must be a number' });

    const t = customThresh || THRESH[field];
    if (!t)
      return res.status(400).json({ error: `Unknown field '${field}'. Provide a custom thresh object or use: ${Object.keys(THRESH).join(', ')}` });

    const v = parseFloat(value);
    res.json({
      field,
      value      : v,
      severity   : severityLevel(v, t),
      normalised : Math.min(1, Math.max(0, (v - t.min) / (t.max - t.min))),
    });
  })
);


// ─── 404 & error handler ─────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Internal server error', detail: err.message });
});


// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🛰  AstroSentinel API running on http://localhost:${PORT}${API}`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app; // for testing
