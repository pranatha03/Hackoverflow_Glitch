import { Radio, Cpu, Zap, Shield } from 'lucide-react';

const NODES = [
    {
        id: '01_COLLECTOR', icon: <Radio size={20} color="var(--cyan)" />,
        name: '01_COLLECTOR',
        desc: 'Deep-space telemetry ingestion and multi-spectral signal normalization.',
        meta: [{ k: 'NID', v: 'INGRESS_04' }, { k: 'LAT', v: '< 12ms' }],
    },
    {
        id: '02_ANALYZER', icon: <Cpu size={20} color="var(--cyan)" />,
        name: '02_ANALYZER',
        desc: 'Neural-network pattern matching for anomalous transient identification.',
        meta: [{ k: 'NID', v: 'NEURAL_28' }, { k: 'THROUGHPUT', v: '1.2TB/s' }],
    },
    {
        id: '03_ALERTER', icon: <Zap size={20} color="var(--cyan)" />,
        name: '03_ALERTER',
        desc: 'Encrypted transmission of threat intelligence to orbital command nodes.',
        meta: [{ k: 'NID', v: 'SEC_LINK' }, { k: 'PRIO', v: 'CRITICAL' }],
    },
];

const LOGS = [
    { date: '2023.11.04', tag: 'STABLE', tagStyle: { background: 'rgba(16,185,129,.2)', color: 'var(--green)', border: 'rgba(16,185,129,.4)' }, hash: '77a1c82...', msg: 'Initial constellation deployment successful. First contact established with Node-Alpha.', current: false },
    { date: '2024.01.12', tag: 'UPDATE', tagStyle: { background: 'rgba(59,130,246,.2)', color: '#60a5fa', border: 'rgba(59,130,246,.4)' }, hash: '33b4e91...', msg: 'Refined analyzer heuristic algorithms. Reduced false positive rate by 42%.', current: false },
    { date: '2024.02.28', tag: 'HOTFIX', tagStyle: { background: 'rgba(239,68,68,.2)', color: 'var(--red)', border: 'rgba(239,68,68,.4)' }, hash: 'a£219c0...', msg: 'Mitigated interference from solar flare event. Rerouted telemetry via secondary relay.', current: false },
    { date: 'CURRENT_DATE', tag: 'HEAD', tagStyle: { background: 'rgba(0,212,255,.1)', color: 'var(--cyan)', border: 'rgba(0,212,255,.3)' }, hash: 'master-origin', msg: 'System nominal. Monitoring background radiation in Sector 7-G.', current: true },
];

export default function InsightsPage() {
    return (
        <div className="page">
            <div className="arch-page">
                {/* Topbar */}
                <div className="arch-topbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="mono" style={{ fontSize: 11, fontWeight: 900, color: '#0b0f18' }}>AS</span>
                        </div>
                        <span className="mono" style={{ fontSize: 12, color: 'var(--text)' }}>ASTRO_SENTINEL // V4.0.2</span>
                    </div>
                    <nav className="arch-nav">
                        <a href="#pipeline" className="active">ARCH_DIAGRAM</a>
                        <a href="#logs">DATA_LOGS</a>
                        <a href="#security">SECURITY_CLEARANCE</a>
                    </nav>
                    <div className="arch-ref">REF: AS-772-X</div>
                </div>

                {/* Dossier header */}
                <div style={{ marginBottom: 44 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                        <div>
                            <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono,monospace', color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 12 }}>
                                PROJECT DOSSIER: SYSTEM_SPECIFICATIONS
                            </div>
                            <h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: 8 }}>
                                Internal Technical Architecture
                            </h1>
                            <div style={{ width: 56, height: 3, background: 'var(--cyan)', borderRadius: 2, marginBottom: 20 }} />
                            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.75, maxWidth: 460 }}>
                                This document outlines the high-level architecture of the ASTRO_SENTINEL monitoring network. Access is restricted to Level 4 personnel and designated Orbital Analysts.
                            </p>
                        </div>
                        <div className="secret-stamp">TOP SECRET // EYE ONLY</div>
                    </div>
                </div>

                {/* 01 Pipeline */}
                <section id="pipeline" style={{ marginBottom: 44 }}>
                    <div className="arch-section-head">
                        <span className="arch-section-num">01.</span>
                        <span className="arch-section-title">SIGNAL_PIPELINE_FLOW</span>
                    </div>
                    <div className="pipeline-grid">
                        {NODES.map(n => (
                            <div className="pipeline-card" key={n.id}>
                                <div className="pipeline-icon">{n.icon}</div>
                                <div className="pipeline-name">{n.name}</div>
                                <p className="pipeline-desc">{n.desc}</p>
                                <div className="pipeline-meta">
                                    {n.meta.map(({ k, v }) => (
                                        <div key={k} className="pipeline-meta-item">
                                            <div className="pipeline-meta-key">{k}:</div>
                                            <div className="pipeline-meta-val">{v}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 02 Mission Log */}
                <section id="logs" style={{ marginBottom: 44 }}>
                    <div className="arch-section-head">
                        <span className="arch-section-num">02.</span>
                        <span className="arch-section-title">MISSION_LOG_GRAPH</span>
                    </div>
                    <div className="log-card">
                        {LOGS.map((l, i) => (
                            <div className="log-entry" key={i}>
                                <div className="log-dot-wrap">
                                    <div className="log-dot" style={{
                                        borderColor: l.current ? 'var(--cyan)' : 'var(--gray)',
                                        background: l.current ? 'rgba(0,212,255,.25)' : 'var(--bg)',
                                    }} />
                                    {i < LOGS.length - 1 && <div className="log-dot-line" />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="log-meta">
                                        <span className="log-date" style={{ color: l.current ? 'var(--cyan)' : 'var(--text2)' }}>{l.date}</span>
                                        <span className="log-tag" style={{ ...l.tagStyle, borderWidth: 1, borderStyle: 'solid' }}>{l.tag}</span>
                                        <span className="log-hash">HASH: {l.hash}</span>
                                    </div>
                                    <p className={`log-msg${l.current ? ' current' : ''}`}>{l.msg}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 03 Security */}
                <section id="security">
                    <div className="sec-grid">
                        <div className="sec-card">
                            <div className="sec-circle">L4</div>
                            <div>
                                <div className="sec-meta-key">Clearance:</div>
                                <div className="sec-meta-val">ORBITAL_ACCESS</div>
                                <div className="sec-meta-id">ID: 992-DELTA-SIGMA</div>
                                <div className="verified-tag">
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
                                    VERIFIED INTEGRITY HASH
                                </div>
                            </div>
                        </div>
                        <div className="sec-card">
                            <div className="sec-circle"><Shield size={20} color="var(--cyan)" /></div>
                            <div>
                                <div className="sec-meta-key">System:</div>
                                <div className="sec-meta-val">HARDENED_KERNEL</div>
                                <div className="sec-meta-id">STATUS: ENCRYPTED_END-TO-END</div>
                                <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono,monospace', color: 'var(--cyan)' }}>AES-256 QUANTUM RESISTANT</div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Bottom arch bar */}
            <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg2)', padding: '10px 24px' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 9, fontFamily: 'JetBrains Mono,monospace', color: 'var(--gray)' }}>
                    <span>© 2024 ASTRO_SENTINEL. NO UNAUTHORIZED REPRODUCTION.</span>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />SERVER_UP</span>
                        <span>NODE: US-EAST-1 // OMEGA</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
