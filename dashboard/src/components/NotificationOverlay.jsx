import React, { useEffect, useState, useRef } from 'react'
import useStore from '../store/store'

const C = {
    bg: 'rgba(2, 8, 20, 0.97)',
    b1: '#0a213a',
    b2: '#103352',
    b3: '#1a4a6e',
    t0: '#e0f2ff',
    t1: '#7ab0ce',
    t2: '#3a6a88',
    t3: '#1a3a50',
    red: '#ff3355',
    amber: '#ffb627',
    green: '#00e898',
    blue: '#00d4ff',
    mono: "'IBM Plex Mono', 'Courier New', monospace",
}

// Single notification card
const NotifCard = ({ notif, onDismiss }) => {
    const [age, setAge] = useState(0)
    const [visible, setVisible] = useState(false)
    const [etaLeft, setEtaLeft] = useState(notif.eta ?? null)
    const AUTO_DISMISS = 15000  // ms

    useEffect(() => {
        // Animate in
        requestAnimationFrame(() => setVisible(true))

        const ageTimer = setInterval(() => setAge(a => a + 1), 1000)

        // ETA countdown
        let etaTimer = null
        if (notif.eta != null) {
            etaTimer = setInterval(() => setEtaLeft(e => (e != null && e > 0 ? e - 1 : 0)), 1000)
        }

        // Auto dismiss
        const autoDismiss = setTimeout(() => {
            setVisible(false)
            setTimeout(() => onDismiss(notif.id), 400)
        }, AUTO_DISMISS)

        return () => {
            clearInterval(ageTimer)
            if (etaTimer) clearInterval(etaTimer)
            clearTimeout(autoDismiss)
        }
    }, [notif.id, onDismiss])

    const threatLabel = (notif.threatType || 'UNKNOWN').replace(/_/g, ' ').toUpperCase()
    const isHigh = notif.riskLevel === 'HIGH'
    const accentColor = isHigh ? C.red : C.amber
    const progressPct = Math.max(0, 100 - (age / (AUTO_DISMISS / 1000)) * 100)

    return (
        <div style={{
            width: 320,
            background: C.bg,
            border: `1px solid ${accentColor}40`,
            boxShadow: `0 0 30px ${accentColor}20, 0 4px 20px rgba(0,0,0,0.6)`,
            marginBottom: 8,
            position: 'relative',
            overflow: 'hidden',
            transform: visible ? 'translateX(0) scaleY(1)' : 'translateX(40px) scaleY(0.92)',
            opacity: visible ? 1 : 0,
            transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease',
        }}>
            {/* Left accent bar */}
            <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                background: accentColor,
                boxShadow: `0 0 8px ${accentColor}`,
                animation: isHigh ? 'notifPulse 1.2s ease-in-out infinite' : 'none',
            }} />

            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 10px 7px 14px',
                borderBottom: `1px solid ${C.b1}`,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* Pulsing dot */}
                    <div style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: accentColor, boxShadow: `0 0 8px ${accentColor}`,
                        animation: 'blinkLed 0.9s step-end infinite',
                        flexShrink: 0,
                    }} />
                    <span style={{
                        color: accentColor, fontSize: '8px', fontFamily: C.mono,
                        letterSpacing: '0.18em', fontWeight: 700,
                    }}>
                        ⚠ {isHigh ? 'CRITICAL THREAT' : 'CAUTION'} — ASSET AT RISK
                    </span>
                </div>
                <button
                    onClick={() => { setVisible(false); setTimeout(() => onDismiss(notif.id), 300) }}
                    style={{
                        background: 'none', border: 'none', color: C.t2,
                        cursor: 'pointer', fontSize: '12px', lineHeight: 1,
                        padding: '0 2px', fontFamily: C.mono,
                    }}
                >×</button>
            </div>

            {/* Body */}
            <div style={{ padding: '10px 14px 12px' }}>
                {/* Satellite name + ID */}
                <div style={{ marginBottom: 10 }}>
                    <div style={{ color: C.t0, fontSize: '13px', fontFamily: C.mono, fontWeight: 600, letterSpacing: '0.04em' }}>
                        {notif.satName}
                    </div>
                    <div style={{ color: C.t2, fontSize: '7.5px', fontFamily: C.mono, letterSpacing: '0.12em', marginTop: 2 }}>
                        NORAD ID: {notif.satId} · RISK SCORE: {notif.riskScore?.toFixed(3) ?? '──'}
                    </div>
                </div>

                {/* Threat type */}
                <div style={{
                    display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10,
                    padding: '5px 8px', background: `${accentColor}08`,
                    border: `1px solid ${accentColor}20`,
                }}>
                    <span style={{ color: C.t2, fontSize: '7px', fontFamily: C.mono, letterSpacing: '0.12em' }}>THREAT CLASS:</span>
                    <span style={{ color: accentColor, fontSize: '8px', fontFamily: C.mono, fontWeight: 600, letterSpacing: '0.1em' }}>
                        {threatLabel}
                    </span>
                </div>

                {/* ETA */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <div style={{ color: C.t3, fontSize: '6.5px', letterSpacing: '0.18em', fontFamily: C.mono, marginBottom: 3 }}>
                            ETA TO SOLAR IMPACT
                        </div>
                        {etaLeft != null ? (
                            <div style={{
                                color: accentColor, fontSize: '22px', fontFamily: C.mono,
                                fontWeight: 700, letterSpacing: '-0.02em',
                                textShadow: `0 0 12px ${accentColor}60`,
                            }}>
                                T‑{String(etaLeft).padStart(4, '0')}
                                <span style={{ fontSize: '9px', color: C.t2, marginLeft: 3 }}>sec</span>
                            </div>
                        ) : (
                            <div style={{ color: C.t2, fontSize: '11px', fontFamily: C.mono }}>
                                IMPACT WINDOW OPEN
                            </div>
                        )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ color: C.t3, fontSize: '6.5px', letterSpacing: '0.12em', fontFamily: C.mono, marginBottom: 2 }}>RISK LEVEL</div>
                        <div style={{
                            color: accentColor, fontSize: '11px', fontFamily: C.mono,
                            fontWeight: 700, letterSpacing: '0.12em',
                            padding: '2px 8px',
                            border: `1px solid ${accentColor}30`, background: `${accentColor}0a`,
                        }}>{notif.riskLevel}</div>
                    </div>
                </div>
            </div>

            {/* Auto-dismiss progress bar */}
            <div style={{ height: 2, background: C.b1 }}>
                <div style={{
                    height: '100%', width: `${progressPct}%`,
                    background: `linear-gradient(90deg, ${accentColor}60, ${accentColor})`,
                    transition: 'width 1s linear',
                }} />
            </div>
        </div>
    )
}

// Overlay container
export default function NotificationOverlay() {
    const notifications = useStore(s => s.notifications)
    const dismissNotification = useStore(s => s.dismissNotification)

    if (notifications.length === 0) return null

    return (
        <div style={{
            position: 'absolute',
            top: 60,
            right: 16,
            zIndex: 200,
            pointerEvents: 'auto',
            display: 'flex',
            flexDirection: 'column-reverse',  // newest at bottom
        }}>
            <style>{`
                @keyframes notifPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
                @keyframes blinkLed   { 0%,100%{opacity:1} 50%{opacity:0} }
            `}</style>
            {[...notifications].reverse().map(n => (
                <NotifCard key={n.id} notif={n} onDismiss={dismissNotification} />
            ))}
        </div>
    )
}
