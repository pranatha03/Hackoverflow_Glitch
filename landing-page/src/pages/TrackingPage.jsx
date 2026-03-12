import { useState } from 'react';
import { mockAlerts, severityConfig, timeAgo } from '../data/mockData';

const sizeMap = [90, 75, 62, 50, 38];
const dotData = [
    { angle: 30, ring: 0, color: 'var(--red)', label: 'NEO-X9', sev: 'critical' },
    { angle: 140, ring: 1, color: 'var(--orange)', label: 'SOL-F4', sev: 'high' },
    { angle: 220, ring: 2, color: 'var(--amber)', label: 'ISS-C2', sev: 'medium' },
    { angle: 305, ring: 0, color: 'var(--gray)', label: 'DEB-M1', sev: 'low' },
    { angle: 75, ring: 4, color: 'var(--gray)', label: 'NEO-A3', sev: 'low' },
    { angle: 195, ring: 3, color: 'var(--orange)', label: 'SOL-G1', sev: 'high' },
    { angle: 260, ring: 1, color: 'var(--red)', label: 'NEO-Y1', sev: 'critical' },
];

export default function TrackingPage() {
    const [filter, setFilter] = useState('all');
    const filtered = filter === 'all' ? mockAlerts : mockAlerts.filter(a => a.severity === filter);

    // Convert angle+ring to x,y percentages
    const toXY = (angleDeg, ringIdx) => {
        const r = (sizeMap[ringIdx] / 2 / 2); // half of ring% → radius as % of container
        const rad = angleDeg * Math.PI / 180;
        return { x: 50 + r * Math.cos(rad), y: 50 + r * Math.sin(rad) };
    };

    return (
        <div className="page">
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
                {/* Header */}
                <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono,monospace', color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '.15em', marginBottom: 6 }}>LIVE TRACKING</div>
                        <h1 style={{ fontSize: 'clamp(2rem,4vw,2.8rem)', fontWeight: 900, color: '#fff', marginBottom: 8 }}>Orbital Tracking</h1>
                        <p style={{ fontSize: 13, color: 'var(--text2)' }}>Real-time positional data for all cataloged objects in Earth orbit.</p>
                    </div>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--card)', color: 'var(--text2)', fontSize: 12, cursor: 'pointer' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>
                        Refresh
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }}>
                    {/* Orbital Map */}
                    <div className="card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" /></svg>
                                Global Orbital Map
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontFamily: 'JetBrains Mono,monospace', color: 'var(--green)' }}>
                                <span className="blink" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
                                LIVE
                            </span>
                        </div>

                        {/* Map */}
                        <div className="tracking-map" style={{ position: 'relative', width: 'min(480px,100%)', margin: '0 auto', aspectRatio: '1', background: '#050a12', borderRadius: 14, overflow: 'hidden' }}>
                            {/* Orbit rings */}
                            {sizeMap.map((s, i) => (
                                <div key={i} style={{
                                    position: 'absolute',
                                    borderRadius: '50%',
                                    border: '1px solid rgba(0,212,255,0.1)',
                                    width: `${s}%`, height: `${s}%`,
                                    top: `${(100 - s) / 2}%`, left: `${(100 - s) / 2}%`,
                                }} />
                            ))}
                            {/* Earth */}
                            <div style={{
                                position: 'absolute', width: '12%', height: '12%', top: '44%', left: '44%',
                                borderRadius: '50%',
                                background: 'radial-gradient(circle at 35% 35%,#1a5a7a,#0d2d3d)',
                                boxShadow: '0 0 20px rgba(0,180,220,.3)',
                                border: '1px solid rgba(0,212,255,.3)',
                            }} />
                            {/* Dots */}
                            {dotData.map(d => {
                                const { x, y } = toXY(d.angle, d.ring);
                                return (
                                    <div key={d.label} style={{
                                        position: 'absolute',
                                        width: 10, height: 10,
                                        borderRadius: '50%',
                                        background: d.color,
                                        boxShadow: `0 0 8px ${d.color}`,
                                        top: `calc(${y}% - 5px)`, left: `calc(${x}% - 5px)`,
                                        cursor: 'pointer',
                                        transition: 'transform .2s',
                                    }}
                                        title={d.label}
                                    />
                                );
                            })}
                            {/* Stars */}
                            {Array.from({ length: 30 }).map((_, i) => (
                                <div key={i} style={{
                                    position: 'absolute',
                                    width: Math.random() < 0.7 ? 1 : 2,
                                    height: Math.random() < 0.7 ? 1 : 2,
                                    borderRadius: '50%', background: '#fff',
                                    top: Math.random() * 100 + '%', left: Math.random() * 100 + '%',
                                    opacity: Math.random() * 0.6 + 0.1,
                                }} />
                            ))}
                        </div>

                        {/* Legend */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                            {[['Critical', 'var(--red)'], ['High', 'var(--orange)'], ['Medium', 'var(--amber)'], ['Nominal', 'var(--gray)']].map(([label, c]) => (
                                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text2)' }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'inline-block' }} />
                                    {label}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Object List */}
                    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Tracked Objects</span>
                            <select
                                value={filter} onChange={e => setFilter(e.target.value)}
                                style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 10px', fontSize: 11, color: 'var(--text2)', outline: 'none', cursor: 'pointer' }}
                            >
                                <option value="all">All Severity</option>
                                {['critical', 'high', 'medium', 'low'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                            </select>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {filtered.map(a => {
                                const cfg = severityConfig[a.severity];
                                return (
                                    <div key={a.id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background .2s' }}
                                        onMouseOver={e => e.currentTarget.style.background = 'var(--card2)'}
                                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                                                <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', fontFamily: 'JetBrains Mono,monospace' }}>{a.id}</span>
                                            </div>
                                            <span style={{ fontSize: 10, color: 'var(--gray)', fontFamily: 'JetBrains Mono,monospace' }}>{timeAgo(a.timestamp)}</span>
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text2)', marginLeft: 14 }}>{a.subtitle}</div>
                                        <div style={{ fontSize: 10, color: 'var(--gray)', fontFamily: 'JetBrains Mono,monospace', marginLeft: 14, marginTop: 2 }}>{a.magnitude}</div>
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border)', fontSize: 10, fontFamily: 'JetBrains Mono,monospace', color: 'var(--gray)' }}>
                            {filtered.length} objects • 1,402 total tracked
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: 16 }}>
                    {[
                        { label: 'LEO Objects', val: '842' },
                        { label: 'MEO Objects', val: '312' },
                        { label: 'GEO Objects', val: '248' },
                        { label: 'Active Threats', val: '12' },
                    ].map(({ label, val }) => (
                        <div className="card" key={label} style={{ padding: '18px 20px' }}>
                            <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono,monospace', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>{label}</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>{val}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
