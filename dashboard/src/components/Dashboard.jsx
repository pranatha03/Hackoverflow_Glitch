import React, { useState, useEffect, useRef } from 'react'
import useStore from '../store/store'
import NotificationOverlay from './NotificationOverlay'

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
    bg: '#020814',
    panel: 'rgba(6, 14, 30, 0.88)',
    panelHover: 'rgba(8, 20, 42, 0.92)',
    b0: '#071428',
    b1: '#0c2240',
    b2: '#14365a',
    b3: '#1e5580',
    b4: '#0044ff22',
    t0: '#e8f4ff',       // text primary
    t1: '#8cc4e0',       // text secondary
    t2: '#4a7fa0',       // text dim
    t3: '#253d52',       // text ghost
    blue: '#00d4ff',     // electric cyan
    violet: '#8b5cf6',   // violet accent
    green: '#10b981',    // nominal
    amber: '#f59e0b',    // caution
    red: '#ef4444',      // critical
    mono: "'SF Mono', 'IBM Plex Mono', 'Cascadia Code', 'Fira Code', monospace",
    sans: "'Inter', 'SF Pro Display', system-ui, sans-serif",
}

const THRESH = {
    radiation_flux: { min: 0, max: 400, warn: 140, crit: 200 },
    solar_wind_speed: { min: 200, max: 1200, warn: 700, crit: 900 },
    magnetic_index: { min: 0, max: 10, warn: 5, crit: 7 },
    particle_density: { min: 0, max: 30, warn: 15, crit: 22 },
}

const statusColor = (v, t) => v >= t.crit ? C.red : v >= t.warn ? C.amber : C.green
const scoreColor = (v, inv = false) => {
    const n = inv ? 1 - v : v
    return n < 0.35 ? C.red : n < 0.65 ? C.amber : C.green
}

// ─── SVG Arc helpers ──────────────────────────────────────────────────────────
const polarXY = (cx, cy, r, angleDeg) => {
    const rad = (angleDeg - 90) * Math.PI / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

const arcPath = (cx, cy, r, start, end) => {
    const s = polarXY(cx, cy, r, end)
    const e = polarXY(cx, cy, r, start)
    const large = (end - start) > 180 ? 1 : 0
    return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 0 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`
}

// ─── Circular Arc Gauge ───────────────────────────────────────────────────────
const ArcGauge = ({ value, thresh, label, unit, size = 120 }) => {
    const cx = size / 2, cy = size / 2
    const r = size * 0.38
    const START = 135, SWEEP = 270

    const rawPct = Math.min(1, Math.max(0, (value - thresh.min) / (thresh.max - thresh.min)))
    const warnPct = (thresh.warn - thresh.min) / (thresh.max - thresh.min)
    const critPct = (thresh.crit - thresh.min) / (thresh.max - thresh.min)
    const endAngle = START + rawPct * SWEEP
    const color = statusColor(value, thresh)
    const fmt = typeof value === 'number' ? (value >= 100 ? value.toFixed(0) : value.toFixed(1)) : '──'

    // Tick marks at warn/crit
    const warnAngle = START + warnPct * SWEEP
    const critAngle = START + critPct * SWEEP

    const tickAt = (angle, inner, outer) => {
        const p1 = polarXY(cx, cy, inner, angle)
        const p2 = polarXY(cx, cy, outer, angle)
        return `M${p1.x},${p1.y}L${p2.x},${p2.y}`
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <svg width={size} height={size} style={{ overflow: 'visible' }}>
                <defs>
                    <filter id={`glow-${label}`} x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>

                {/* Track */}
                <path d={arcPath(cx, cy, r, START, START + SWEEP)}
                    fill="none" stroke={C.b1} strokeWidth="6" strokeLinecap="round" />

                {/* Value arc */}
                {rawPct > 0 && (
                    <path d={arcPath(cx, cy, r, START, endAngle)}
                        fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
                        style={{ filter: `url(#glow-${label})` }}
                    />
                )}

                {/* Warn tick */}
                <path d={tickAt(warnAngle, r - 6, r + 3)} stroke={C.amber} strokeWidth="1" opacity="0.5" />
                {/* Crit tick */}
                <path d={tickAt(critAngle, r - 6, r + 3)} stroke={C.red} strokeWidth="1" opacity="0.5" />

                {/* End dot */}
                {rawPct > 0.01 && (() => {
                    const ep = polarXY(cx, cy, r, endAngle)
                    return <circle cx={ep.x} cy={ep.y} r="3.5" fill={color} style={{ filter: `url(#glow-${label})` }} />
                })()}

                {/* Center value */}
                <text x={cx} y={cy - 4} textAnchor="middle" dominantBaseline="middle"
                    fill={color} fontFamily={C.mono} fontSize={size * 0.18} fontWeight="600"
                    style={{ filter: rawPct > 0.7 ? `drop-shadow(0 0 6px ${color})` : 'none' }}>
                    {fmt}
                </text>
                <text x={cx} y={cy + size * 0.14} textAnchor="middle"
                    fill={C.t2} fontFamily={C.mono} fontSize={size * 0.08}>
                    {unit}
                </text>
            </svg>
            <div style={{ color: C.t1, fontSize: '9px', letterSpacing: '0.04em', fontFamily: C.sans, fontWeight: 500, textAlign: 'center' }}>
                {label}
            </div>
            <div style={{
                fontSize: '8px', fontFamily: C.mono, fontWeight: 600,
                color: statusColor(value, thresh) === C.red ? C.red : statusColor(value, thresh) === C.amber ? C.amber : C.t3,
            }}>
                {statusColor(value, thresh) === C.red ? 'CRITICAL' : statusColor(value, thresh) === C.amber ? 'CAUTION' : 'NOMINAL'}
            </div>
        </div>
    )
}

// ─── Bezier Sparkline ────────────────────────────────────────────────────────
let skId = 0
const Spark = ({ data, color, width = 100, height = 28 }) => {
    const id = useRef(`sp${skId++}`).current
    if (!data || data.length < 3) return null
    const lo = Math.min(...data), hi = Math.max(...data)
    const rng = hi - lo || 1
    const W = width, H = height
    const xs = data.map((_, i) => (i / (data.length - 1)) * W)
    const ys = data.map(v => H - ((v - lo) / rng) * (H - 4) - 2)

    // Build smooth bezier path
    let d = `M${xs[0]},${ys[0]}`
    for (let i = 1; i < xs.length; i++) {
        const cpx1 = xs[i - 1] + (xs[i] - xs[i - 1]) * 0.4
        const cpx2 = xs[i] - (xs[i] - (i > 1 ? xs[i - 1] : xs[0])) * 0.4
        d += ` C${cpx1},${ys[i - 1]} ${cpx2},${ys[i]} ${xs[i]},${ys[i]}`
    }
    const area = `${d} L${W},${H} L0,${H} Z`

    return (
        <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
            <defs>
                <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={area} fill={`url(#${id})`} />
            <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
    )
}

// ─── Score Ring (compact circular score) ─────────────────────────────────────
const ScoreRing = ({ value, label, inverted = false, size = 72 }) => {
    const cx = size / 2, cy = size / 2, r = size * 0.36
    const pct = Math.min(1, Math.max(0, value))
    const angle = 135 + pct * 270
    const color = scoreColor(value, inverted)
    const display = (pct * 100).toFixed(0)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <svg width={size} height={size}>
                <path d={arcPath(cx, cy, r, 135, 405)} fill="none" stroke={C.b1} strokeWidth="4" strokeLinecap="round" />
                {pct > 0 && (
                    <path d={arcPath(cx, cy, r, 135, angle)} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
                )}
                <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
                    fill={color} fontFamily={C.mono} fontSize={size * 0.22} fontWeight="600">
                    {display}
                </text>
            </svg>
            <div style={{ color: C.t1, fontSize: '9px', letterSpacing: '0.04em', fontFamily: C.sans, fontWeight: 500 }}>
                {label}
            </div>
        </div>
    )
}

// ─── Panel ────────────────────────────────────────────────────────────────────
const Panel = ({ children, style = {}, glow = false }) => (
    <div style={{
        position: 'relative',
        background: C.panel,
        border: `1px solid ${C.b1}`,
        borderRadius: 6,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: glow
            ? `0 0 0 1px ${C.b2}, 0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)`
            : `0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.02)`,
        ...style,
    }}>
        {children}
    </div>
)

// ─── Section Label ────────────────────────────────────────────────────────────
const SectionLabel = ({ text, right, accent = C.blue }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 3, height: 12, background: accent, borderRadius: 1, opacity: 0.8 }} />
            <span style={{ color: C.t1, fontSize: '10px', letterSpacing: '0.08em', fontFamily: C.sans, fontWeight: 600, textTransform: 'uppercase' }}>
                {text}
            </span>
        </div>
        {right}
    </div>
)

// ─── KV Stat ──────────────────────────────────────────────────────────────────
const KV = ({ k, v, vColor = C.t1, large = false }) => (
    <div>
        <div style={{ color: C.t2, fontSize: '9px', letterSpacing: '0.06em', fontFamily: C.sans, fontWeight: 500, marginBottom: 3, opacity: 0.7 }}>{k}</div>
        <div style={{ color: vColor, fontSize: large ? '16px' : '12px', fontFamily: C.mono, fontWeight: large ? 600 : 500, letterSpacing: '-0.01em' }}>{v}</div>
    </div>
)

// ─── Threat Row ───────────────────────────────────────────────────────────────
const ThreatRow = ({ sat, idx }) => {
    const lc = sat.risk_level === 'HIGH' ? C.red : sat.risk_level === 'MEDIUM' ? C.amber : C.green
    return (
        <tr style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)', borderBottom: `1px solid ${C.b0}`, transition: 'background .15s' }}>
            <td style={{ padding: '10px 12px' }}>
                <div style={{ color: C.t0, fontSize: '11px', fontFamily: C.mono, fontWeight: 600 }}>{sat.id}</div>
                <div style={{ color: C.t2, fontSize: '9px', fontFamily: C.sans, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 110 }}>{sat.name}</div>
            </td>
            <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: `${lc}15` }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: lc, boxShadow: `0 0 6px ${lc}` }} />
                    <span style={{ color: lc, fontSize: '9px', fontFamily: C.mono, fontWeight: 600 }}>{sat.risk_level}</span>
                </div>
            </td>
            <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                <span style={{ color: lc, fontSize: '14px', fontFamily: C.mono, fontWeight: 700 }}>{sat.risk_score.toFixed(3)}</span>
                <div style={{ height: 3, background: C.b1, marginTop: 5, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${sat.risk_score * 100}%`, background: `linear-gradient(90deg, ${lc}80, ${lc})`, borderRadius: 2 }} />
                </div>
            </td>
            <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                {sat.eta
                    ? <span style={{ color: C.amber, fontSize: '11px', fontFamily: C.mono, fontWeight: 500 }}>T‑{sat.eta}s</span>
                    : <span style={{ color: C.t3, fontFamily: C.mono, fontSize: '11px' }}>—</span>}
            </td>
            <td style={{ padding: '10px 8px' }}>
                <span style={{ color: C.t2, fontSize: '9px', fontFamily: C.sans, fontWeight: 500 }}>
                    {sat.threat_type !== 'nominal' ? sat.threat_type.replace(/_/g, ' ').toUpperCase() : 'NOMINAL'}
                </span>
            </td>
        </tr>
    )
}

// ─── Pulsing Alert Banner ─────────────────────────────────────────────────────
const AlertBanner = ({ active, color, text }) => {
    if (!active) return null
    return (
        <div style={{
            position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)',
            zIndex: 20, pointerEvents: 'none',
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '8px 24px',
            background: `${color}0d`,
            border: `1px solid ${color}40`,
            boxShadow: `0 0 30px ${color}20, inset 0 0 20px ${color}08`,
            animation: 'pulseAlert 1.5s ease-in-out infinite',
        }}>
            <div style={{
                width: 8, height: 8, borderRadius: '50%', background: color,
                boxShadow: `0 0 8px ${color}`,
                animation: 'blinkLed 0.8s step-end infinite',
            }} />
            <span style={{ color, fontSize: '11px', fontFamily: C.sans, fontWeight: 600, letterSpacing: '0.06em' }}>
                {text}
            </span>
        </div>
    )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const HIST = 60

export default function Dashboard({ apiBase = '' }) {
    const telemetry = useStore(s => s.telemetry)
    const metrics = useStore(s => s.aiMetrics)
    const alerts = useStore(s => s.alerts)
    const isConnected = useStore(s => s.isConnected)
    const catastrophic = useStore(s => s.catastrophicMode)
    const toggleCata = useStore(s => s.toggleCatastrophic)

    const startRef = useRef(null)
    const [met, setMet] = useState(0)
    const [utc, setUtc] = useState('')
    const [pkts, setPkts] = useState(0)
    const [flash, setFlash] = useState(false)

    const INITIAL_HIST = {
        radiation_flux: Array(HIST).fill(120),
        solar_wind_speed: Array(HIST).fill(450),
        magnetic_index: Array(HIST).fill(3),
        particle_density: Array(HIST).fill(8),
    }
    const histRef = useRef(INITIAL_HIST)
    const [hist, setHist] = useState(INITIAL_HIST)

    useEffect(() => {
        if (!telemetry.timestamp) return
        const h = histRef.current
        Object.keys(h).forEach(k => {
            if (telemetry[k] !== undefined) h[k] = [...h[k].slice(1), telemetry[k]]
        })
        setHist({ ...h })
        setPkts(n => n + 1)
        setFlash(true)
        setTimeout(() => setFlash(false), 150)
    }, [telemetry])

    useEffect(() => {
        const tick = () => {
            if (startRef.current === null) startRef.current = Date.now()
            setMet(Math.floor((Date.now() - startRef.current) / 1000))
            setUtc(new Date().toUTCString().split(' ').slice(1, 5).join(' '))
        }
        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [])

    const metStr = (() => {
        const h = String(Math.floor(met / 3600)).padStart(3, '0')
        const m = String(Math.floor((met % 3600) / 60)).padStart(2, '0')
        const s = String(met % 60).padStart(2, '0')
        return `${h}:${m}:${s}`
    })()

    const sysColor = metrics.classification === 'CRITICAL' ? C.red
        : metrics.classification === 'CAUTION' ? C.amber : C.green

    const isNoaa = telemetry.data_source === 'NOAA SWPC'
    const highAlerts = (alerts || []).filter(a => a.risk_level === 'HIGH').length
    const isCritical = metrics.classification === 'CRITICAL' || catastrophic

    const triggerFlare = async () => {
        try { await fetch(`${apiBase}/api/trigger-flare`, { method: 'POST' }) } catch { /* ignore */ }
    }
    const triggerCata = async () => {
        toggleCata(!catastrophic)
        try { await fetch(`${apiBase}/api/trigger-catastrophic?enable=${!catastrophic}`, { method: 'POST' }) } catch { /* ignore */ }
    }

    const btn = (label, onClick, active, color = C.red) => (
        <button onClick={onClick} style={{
            background: active ? `${color}18` : 'rgba(255,255,255,0.03)',
            border: `1px solid ${active ? color + '50' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 4,
            color: active ? color : C.t1,
            fontSize: '10px', letterSpacing: '0.04em', padding: '6px 16px',
            cursor: 'pointer', fontFamily: C.sans, fontWeight: 600, textTransform: 'uppercase',
            boxShadow: active ? `0 0 20px ${color}20` : 'none',
            transition: 'all .2s ease', pointerEvents: 'auto',
        }}>{label}</button>
    )

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', fontFamily: C.mono, background: 'transparent' }}>

            {/* Satellite alert notification popups */}
            <NotificationOverlay />

            {/* CSS Keyframes */}
            <style>{`
        @keyframes pulseAlert { 0%,100%{opacity:1} 50%{opacity:.7} }
        @keyframes blinkLed   { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeSlide  { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:none} }
        .hs-scroll::-webkit-scrollbar { width: 3px; background: transparent; }
        .hs-scroll::-webkit-scrollbar-thumb { background: ${C.b3}; border-radius: 3px; }
        .hs-panel { animation: fadeSlide .35s ease both; }
      `}</style>

            {/* Alert banner */}
            <AlertBanner
                active={isCritical && highAlerts > 0}
                color={C.red}
                text={`${highAlerts} HIGH-RISK ASSET${highAlerts > 1 ? 'S' : ''} — IMMEDIATE ATTENTION REQUIRED`}
            />

            {/* ══ HEADER ═══════════════════════════════════════════════════════════ */}
            <header style={{
                background: 'rgba(4,10,22,0.92)',
                borderBottom: `1px solid rgba(255,255,255,0.06)`,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                padding: '0 24px',
                height: 56,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexShrink: 0, pointerEvents: 'auto', position: 'relative', zIndex: 50,
                boxShadow: '0 1px 0 rgba(255,255,255,0.03), 0 8px 32px rgba(0,0,0,0.4)',
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34 }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: C.blue, boxShadow: `0 0 14px ${C.blue}80` }} />
                        <div style={{ position: 'absolute', width: 30, height: 30, border: `1.5px solid ${C.blue}25`, borderRadius: '50%' }} />
                    </div>
                    <div>
                        <div style={{ color: C.t0, fontSize: '15px', letterSpacing: '0.14em', fontWeight: 700, fontFamily: C.sans }}>
                            ASTRO SENTINEL
                        </div>
                        <div style={{ color: C.t3, fontSize: '9px', letterSpacing: '0.06em', marginTop: 1, fontFamily: C.sans, fontWeight: 500 }}>
                            Solar Weather Intelligence · ASL‑7
                        </div>
                    </div>
                </div>

                {/* Center — MET / Timestamp / System Status */}
                <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: C.t2, fontSize: '9px', letterSpacing: '0.08em', fontFamily: C.sans, fontWeight: 500, marginBottom: 2 }}>MET</div>
                        <div style={{ color: C.blue, fontSize: '16px', fontWeight: 600, fontFamily: C.mono, letterSpacing: '0.04em' }}>{metStr}</div>
                    </div>
                    <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.06)' }} />
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: C.t2, fontSize: '9px', letterSpacing: '0.08em', fontFamily: C.sans, fontWeight: 500, marginBottom: 2 }}>UTC</div>
                        <div style={{ color: C.t1, fontSize: '12px', fontFamily: C.mono }}>{utc}</div>
                    </div>
                    <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.06)' }} />
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: C.t2, fontSize: '9px', letterSpacing: '0.08em', fontFamily: C.sans, fontWeight: 500, marginBottom: 3 }}>STATUS</div>
                        <div style={{
                            color: sysColor, fontSize: '13px', letterSpacing: '0.1em', fontFamily: C.mono, fontWeight: 700,
                        }}>{metrics.classification || '—'}</div>
                    </div>
                    <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.06)' }} />
                    {/* Live indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: isConnected ? C.green : C.red,
                            boxShadow: `0 0 8px ${isConnected ? C.green : C.red}80`,
                            animation: isConnected ? 'blinkLed 2s ease-in-out infinite' : 'none',
                        }} />
                        <div>
                            <div style={{ color: C.t2, fontSize: '9px', fontFamily: C.sans, fontWeight: 500 }}>Data Link</div>
                            <div style={{ color: isConnected ? C.green : C.red, fontSize: '11px', fontFamily: C.mono, fontWeight: 600 }}>
                                {isConnected ? 'LIVE' : 'OFFLINE'}
                            </div>
                        </div>
                    </div>
                    {/* NOAA badge */}
                    <div style={{
                        padding: '4px 12px',
                        borderRadius: 4,
                        background: isNoaa ? `${C.green}12` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isNoaa ? C.green + '30' : 'rgba(255,255,255,0.06)'}`,
                    }}>
                        <div style={{ color: C.t2, fontSize: '8px', fontFamily: C.sans, fontWeight: 500 }}>Source</div>
                        <div style={{ color: isNoaa ? C.green : C.t2, fontSize: '10px', fontFamily: C.mono, fontWeight: 600 }}>
                            {isNoaa ? 'NOAA SWPC' : 'SYNTHETIC'}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', gap: 8 }}>
                    {btn('Solar Flare', triggerFlare, false, C.amber)}
                    {btn(catastrophic ? '⚠ Omega Active' : 'Protocol Omega', triggerCata, catastrophic, C.red)}
                </div>
            </header>

            {/* ══ BODY ═════════════════════════════════════════════════════════════ */}
            <div style={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative' }}>

                {/* ── LEFT PANEL ───────────────────────────────────────────────────── */}
                <div style={{ width: 310, display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0, pointerEvents: 'auto', padding: '8px 8px 8px 8px' }}>

                    {/* Sensor Array — 4 Arc Gauges */}
                    <Panel style={{ padding: '16px 18px', flexShrink: 0 }} glow>
                        <SectionLabel text="Sensor Array"
                            right={<span style={{ color: isConnected ? C.green : C.t3, fontSize: '9px', fontFamily: C.mono }}>
                                {flash && isConnected ? '● RX' : '○'}
                            </span>}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 4px', justifyItems: 'center' }}>
                            <ArcGauge value={telemetry.radiation_flux ?? 0} thresh={THRESH.radiation_flux} label="Radiation Flux" unit="W/m²" />
                            <ArcGauge value={telemetry.solar_wind_speed ?? 0} thresh={THRESH.solar_wind_speed} label="Solar Wind" unit="km/s" />
                            <ArcGauge value={telemetry.magnetic_index ?? 0} thresh={THRESH.magnetic_index} label="Kp Index" unit="Kp" />
                            <ArcGauge value={telemetry.particle_density ?? 0} thresh={THRESH.particle_density} label="Proton Density" unit="p/cm³" />
                        </div>
                    </Panel>

                    {/* Trend Charts */}
                    <Panel style={{ padding: '14px 18px', flexShrink: 0 }}>
                        <SectionLabel text="Trend Analysis" />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[
                                ['Radiation', 'radiation_flux', THRESH.radiation_flux],
                                ['Solar Wind', 'solar_wind_speed', THRESH.solar_wind_speed],
                                ['Kp Index', 'magnetic_index', THRESH.magnetic_index],
                                ['Particle Density', 'particle_density', THRESH.particle_density],
                            ].map(([label, key, t]) => {
                                const v = telemetry[key] ?? 0
                                const color = statusColor(v, t)
                                return (
                                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 8 }}>
                                        <div style={{ color: C.t2, fontSize: '9px', fontFamily: C.sans, fontWeight: 500, width: 80, flexShrink: 0 }}>{label}</div>
                                        <Spark data={hist[key]} color={color} width={150} height={24} />
                                    </div>
                                )
                            })}
                        </div>
                    </Panel>

                    {/* NOAA Live Fields */}
                    {isNoaa && (
                        <Panel style={{ padding: '14px 18px', flexShrink: 0 }}>
                            <SectionLabel text="NOAA Live Data" accent={C.green} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <KV k="Bz GSM"
                                    v={`${(telemetry.bz_gsm ?? 0) >= 0 ? '+' : ''}${(telemetry.bz_gsm ?? 0).toFixed(1)} nT`}
                                    vColor={(telemetry.bz_gsm ?? 0) < -10 ? C.red : (telemetry.bz_gsm ?? 0) < 0 ? C.amber : C.green}
                                />
                                <KV k="Bt Total"
                                    v={`${(telemetry.bt ?? 0).toFixed(1)} nT`}
                                    vColor={C.blue}
                                />
                                <KV k="Data Confidence" v={`${metrics.confidence ?? 0}%`} vColor={C.blue} />
                                <KV k="Forecast Window"
                                    v={metrics.predicted_risk_window !== null ? `T+${metrics.predicted_risk_window}` : 'CLEAR'}
                                    vColor={metrics.predicted_risk_window !== null ? C.amber : C.t3}
                                />
                            </div>
                        </Panel>
                    )}
                </div>

                {/* Center: 3D scene */}
                <div style={{ flex: 1 }} />

                {/* ── RIGHT PANEL ──────────────────────────────────────────────────── */}
                <div style={{ width: 400, display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0, pointerEvents: 'auto', padding: '8px 8px 8px 8px' }}>

                    {/* AI Diagnostics — Score Rings */}
                    <Panel style={{ padding: '16px 16px', flexShrink: 0 }} glow>
                        <SectionLabel text="AI Detection Engine" accent={C.violet} />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', justifyItems: 'center', gap: 4 }}>
                            <ScoreRing value={metrics.stability_score ?? 0} label="Stability" />
                            <ScoreRing value={metrics.anomaly_score ?? 0} label="Anomaly Idx" inverted />
                            <ScoreRing value={metrics.drift_score ?? 0} label="Drift Coef" inverted />
                        </div>
                        <div style={{ marginTop: 14, padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 4, borderLeft: `3px solid ${C.violet}40` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <KV k="ML Model" v="LSTM + Autoencoder" vColor={C.t1} />
                                <KV k="Training Source" v={metrics.data_mode === 'NOAA' ? 'NOAA REAL' : 'SYNTHETIC'} vColor={metrics.data_mode === 'NOAA' ? C.green : C.t2} />
                                <KV k="Confidence" v={`${metrics.confidence ?? 0}%`} vColor={C.blue} />
                            </div>
                        </div>
                    </Panel>

                    {/* Threat Matrix */}
                    <Panel style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '14px 16px', borderBottom: `1px solid rgba(255,255,255,0.05)`, flexShrink: 0 }}>
                            <SectionLabel text="Threat Assessment"
                                right={
                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                        {[['HIGH', C.red], ['MED', C.amber], ['LOW', C.green]].map(([level, col]) => {
                                            const lvl = level === 'MED' ? 'MEDIUM' : level
                                            return (
                                                <div key={level} style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: col, boxShadow: `0 0 6px ${col}` }} />
                                                    <span style={{ color: col, fontSize: '10px', fontFamily: C.mono, fontWeight: 500 }}>
                                                        {(alerts || []).filter(a => a.risk_level === lvl).length} {level}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                }
                            />
                        </div>
                        <div style={{ overflowY: 'auto', flex: 1 }} className="hs-scroll">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(4,10,22,0.95)', position: 'sticky', top: 0, borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
                                        {[['ASSET', 'left'], ['STATUS', 'center'], ['RISK', 'right'], ['ETA', 'center'], ['CLASS', 'left']].map(([h, align]) => (
                                            <th key={h} style={{ padding: '8px 10px', textAlign: align, color: C.t2, fontSize: '9px', letterSpacing: '0.06em', fontWeight: 600, fontFamily: C.sans }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(alerts || []).length === 0
                                        ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px 20px', color: C.t3, fontSize: '11px', fontFamily: C.sans, fontWeight: 500 }}>
                                            No active threats detected
                                        </td></tr>
                                        : (alerts || []).map((sat, i) => <ThreatRow key={sat.id} sat={sat} idx={i} />)
                                    }
                                </tbody>
                            </table>
                        </div>
                    </Panel>
                </div>
            </div>

            {/* ══ FOOTER ══════════════════════════════════════════════════════════ */}
            <footer style={{
                background: 'rgba(4,8,18,0.9)',
                borderTop: `1px solid rgba(255,255,255,0.05)`,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                padding: '6px 24px',
                display: 'flex', alignItems: 'center', gap: 20,
                flexShrink: 0, pointerEvents: 'auto',
            }}>
                {[
                    ['System', 'ASL-7', C.t2],
                    ['Source', isNoaa ? 'NOAA SWPC' : 'Synthetic', isNoaa ? C.green : C.t3],
                    ['Mode', catastrophic ? '⚠ Catastrophic' : 'Nominal', catastrophic ? C.red : C.t3],
                    ['Confidence', `${metrics.confidence ?? 0}%`, C.blue],
                    ['Packets', pkts.toLocaleString(), C.t1],
                ].map(([k, v, col]) => (
                    <div key={k} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ color: C.t3, fontSize: '9px', fontFamily: C.sans, fontWeight: 500 }}>{k}</span>
                        <span style={{ color: col, fontSize: '10px', fontFamily: C.mono, fontWeight: 500 }}>{v}</span>
                    </div>
                ))}
                <div style={{ flex: 1 }} />
                <div style={{ color: C.t3, fontSize: '9px', fontFamily: C.sans, fontWeight: 500 }}>
                    Astro Sentinel · Solar Weather Intelligence
                </div>
            </footer>
        </div>
    )
}
