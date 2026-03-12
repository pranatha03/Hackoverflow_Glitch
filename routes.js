// ASTRO SENTINEL — AI Routes
// Handles communication with Flask AI Service

const express = require("express");
const axios = require("axios");

const router = express.Router();

const FLASK_URL = process.env.FLASK_URL || "http://localhost:5000";

// Axios instance with timeout + better control
const flaskAPI = axios.create({
  baseURL: FLASK_URL,
  timeout: 10000 // 10 seconds timeout
});

// ─────────────────────────────────────────────
// GET /api/health
// Checks Flask API health
// ─────────────────────────────────────────────
router.get("/health", async (req, res, next) => {
  try {
    const response = await flaskAPI.get("/health");

    res.status(200).json({
      success: true,
      flask_status: response.data
    });

  } catch (error) {
    next({
      status: 500,
      message: "Flask AI service is not reachable"
    });
  }
});

// ─────────────────────────────────────────────
// POST /api/predict
// ─────────────────────────────────────────────
router.post("/predict", async (req, res, next) => {
  try {
    const response = await flaskAPI.post("/predict", req.body);

    res.status(200).json({
      success: true,
      data: response.data
    });

  } catch (error) {
    next({
      status: error.response?.status || 500,
      message: error.response?.data?.error || "Prediction failed"
    });
  }
});

// ─────────────────────────────────────────────
// POST /api/anomaly
// ─────────────────────────────────────────────
router.post("/anomaly", async (req, res, next) => {
  try {
    const response = await flaskAPI.post("/anomaly", req.body);

    res.status(200).json({
      success: true,
      data: response.data
    });

  } catch (error) {
    next({
      status: error.response?.status || 500,
      message: error.response?.data?.error || "Anomaly detection failed"
    });
  }
});

// ─────────────────────────────────────────────
// POST /api/drift
// ─────────────────────────────────────────────
router.post("/drift", async (req, res, next) => {
  try {
    const response = await flaskAPI.post("/drift", req.body);

    res.status(200).json({
      success: true,
      data: response.data
    });

  } catch (error) {
    next({
      status: error.response?.status || 500,
      message: error.response?.data?.error || "Drift detection failed"
    });
  }
});

module.exports = router;