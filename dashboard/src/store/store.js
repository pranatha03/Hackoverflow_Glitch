import { create } from 'zustand'

const useStore = create((set) => ({
    // Telemetry Data
    telemetry: {
        radiation_flux: 0,
        solar_wind_speed: 0,
        magnetic_index: 0,
        particle_density: 0,
        timestamp: null
    },

    // AI Metrics
    aiMetrics: {
        anomaly_score: 0,
        drift_score: 0,
        stability_score: 1,
        predicted_risk_window: null,
        classification: 'STABLE',
        confidence: 100
    },

    // Alerts (per-satellite risk assessments)
    alerts: [],

    // Real satellite positions from CelesTrak TLE data
    orbital_bodies: [],

    // Notification queue — cards shown in the overlay
    notifications: [],

    // System State
    isConnected: false,
    catastrophicMode: false,

    // Focus State
    focusTarget: null,

    // Actions
    setFocus: (target) => set({ focusTarget: target }),

    updateData: (payload) => set((state) => {
        const newAlerts = payload.alerts || state.alerts
        const prevAlerts = state.alerts

        // Detect newly HIGH-risk satellites → generate notifications
        const newNotifications = []
        newAlerts.forEach(alert => {
            if (alert.risk_level === 'HIGH') {
                // Only notify if it wasn't already HIGH (avoid spam)
                const wasHigh = prevAlerts.some(a => a.id === alert.id && a.risk_level === 'HIGH')
                if (!wasHigh) {
                    newNotifications.push({
                        id: `${alert.id}-${Date.now()}`,
                        satId: alert.id,
                        satName: alert.name || alert.id,
                        riskLevel: alert.risk_level,
                        threatType: alert.threat_type,
                        riskScore: alert.risk_score,
                        eta: alert.eta,
                        timestamp: Date.now(),
                    })
                }
            }
        })

        return {
            telemetry: payload.telemetry || state.telemetry,
            aiMetrics: payload.ai_metrics || state.aiMetrics,
            alerts: newAlerts,
            orbital_bodies: payload.orbital_bodies || state.orbital_bodies,
            isConnected: true,
            notifications: [...state.notifications, ...newNotifications].slice(-10), // keep last 10
        }
    }),

    dismissNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id),
    })),

    setConnectionStatus: (status) => set({ isConnected: status }),
    toggleCatastrophic: (status) => set({ catastrophicMode: status }),
}))

export default useStore
