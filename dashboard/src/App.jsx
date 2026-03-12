import React, { useEffect } from 'react'
import SceneManager from './scene/SceneManager'
import Dashboard from './components/Dashboard'
import useStore from './store/store'

// Base URL: empty string in dev (Vite proxy handles /api/*),
// or the full origin in production (set VITE_API_URL=https://your-api.com)
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

function App() {
  const updateData = useStore((state) => state.updateData)
  const setConnectionStatus = useStore((state) => state.setConnectionStatus)

  useEffect(() => {
    let pollInterval = null
    let retryDelay = 2000          // start at 2 s
    const MAX_DELAY = 30000        // cap at 30 s
    let retryTimer = null
    let staleTimer = null          // fires if no message for 15 s

    const resetStaleTimer = () => {
      clearTimeout(staleTimer)
      staleTimer = setTimeout(() => {
        // reconnect if data stops
        console.warn('[HeliosSentinel] Data stale, reconnecting...')
        connect()
      }, 15000)
    }

    const connect = () => {
      if (pollInterval) { clearInterval(pollInterval); pollInterval = null }
      clearTimeout(retryTimer)
      
      setConnectionStatus(true)
      retryDelay = 2000
      
      const poll = async () => {
        try {
          const [healthRes, predictRes, anomalyRes, driftRes] = await Promise.all([
            fetch(`${API_BASE}/api/health`),
            fetch(`${API_BASE}/api/predict`),
            fetch(`${API_BASE}/api/anomaly`),
            fetch(`${API_BASE}/api/drift`)
          ])

          if (!healthRes.ok) throw new Error(`Health check failed: ${healthRes.status}`)

          const health = await healthRes.json()
          const predict = await predictRes.json()
          const anomaly = await anomalyRes.json()
          const drift = await driftRes.json()

          // We check if data is a heartbeat (just in case backend uses it, though we removed it)
          updateData({
            telemetry: predict.telemetry,
            ai_metrics: {
              ...(predict.ai_metrics || {}),
              drift_score: drift.drift_score
            },
            alerts: anomaly.alerts,
            orbital_bodies: predict.orbital_bodies
          })

          resetStaleTimer()
        } catch (e) {
          console.error('[HeliosSentinel] Poll error', e)
          setConnectionStatus(false)
          
          if (pollInterval) { clearInterval(pollInterval); pollInterval = null }
          clearTimeout(staleTimer)
          clearTimeout(retryTimer)
          
          retryTimer = setTimeout(() => {
            retryDelay = Math.min(retryDelay * 2, MAX_DELAY)
            connect()
          }, retryDelay)
        }
      }

      // Initial call
      poll()
      
      // Setup interval
      pollInterval = setInterval(poll, 2000)
    }

    connect()

    return () => {
      clearTimeout(retryTimer)
      clearTimeout(staleTimer)
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [updateData, setConnectionStatus])

  return (
    <div className="w-full h-screen bg-space-950 text-white relative overflow-hidden">
      {/* 3D Scene Background */}
      <div className="absolute inset-0 z-0">
        <SceneManager />
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Dashboard apiBase={API_BASE} />
      </div>
    </div>
  )
}

export default App
