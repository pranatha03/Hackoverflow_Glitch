import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, ChevronLeft, ShieldAlert, Cpu, Network, Database, Activity, Code } from 'lucide-react';

const customStyles = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .doc-section {
    animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    opacity: 0;
  }
`;

const DocsPage = () => {
    const navigate = useNavigate();
    const textMuted = '#94a3b8';

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-base" style={{ minHeight: '100vh', paddingBottom: '120px' }}>
            <style>{customStyles}</style>
            <div className="grid-overlay" />
            <div className="ambient-light" />

            {/* Premium Navbar Container */}
            <nav style={{
                position: 'sticky', top: 0, left: 0, width: '100%', zIndex: 50,
                background: 'rgba(2, 3, 5, 0.85)', backdropFilter: 'blur(32px)',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px 64px', transition: 'all 0.4s ease'
            }}>
                {/* Logo/Brand */}
                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <span style={{ color: '#ffffff', fontSize: '17px', fontWeight: 800, letterSpacing: '1.5px' }}>ASTRO</span>
                    <span style={{ color: '#00e5ff', fontSize: '17px', fontWeight: 400, letterSpacing: '1.5px', marginLeft: '6px' }}>SENTINEL</span>
                </div>

                {/* Navigation Links */}
                <div style={{ display: 'flex', gap: '36px', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
                    <span style={{ cursor: 'pointer', transition: 'color 0.2s', color: '#fff' }} onClick={() => navigate('/docs')}>Architecture Docs</span>
                </div>

                <button
                    onClick={() => navigate('/')}
                    style={{
                        background: '#ffffff', color: '#000000', border: 'none', borderRadius: '4px',
                        padding: '10px 24px', fontSize: '13px', fontWeight: 700,
                        cursor: 'pointer', transition: 'all 0.2s ease',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }}
                    onMouseOver={e => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,255,255,0.15)';
                    }}
                    onMouseOut={e => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                    }}
                >
                    Back to Home
                </button>
            </nav>

            {/* Header */}
            <header style={{ padding: '80px 48px 40px', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }} className="doc-section">
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: '99px', color: '#00e5ff', fontSize: '13px', fontWeight: 600, marginBottom: '24px' }}>
                    <Code size={14} />
                    v2.0 Documentation
                </div>
                <h1 style={{ fontSize: '56px', fontWeight: 900, margin: '0 0 24px 0', letterSpacing: '-1px' }}>System Architecture</h1>
                <p style={{ fontSize: '20px', color: textMuted, lineHeight: 1.6, maxWidth: '700px', margin: '0 auto' }}>
                    ASTRO_SENTINEL is a deterministic telemetry analysis engine designed to monitor, predict, and mitigate orbital anomalies in real-time.
                </p>
            </header>

            {/* Content */}
            <main style={{ maxWidth: '900px', margin: '0 auto', padding: '0 48px' }}>

                {/* Section 1 */}
                <section className="doc-section" style={{ animationDelay: '0.1s', marginTop: '64px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Network size={24} color="#fff" />
                        </div>
                        <h2 style={{ fontSize: '32px', fontWeight: 800, margin: 0 }}>Distributed System Architecture</h2>
                    </div>
                    <div className="ultra-glass-card" style={{ padding: '40px', fontSize: '16px', lineHeight: 1.8, color: '#e2e8f0' }}>
                        <p style={{ marginBottom: '20px' }}>
                            The primary mission control dashboard (located in the <code>HACKOVERFLOW</code> repository) operates on a highly decoupled architecture. It separates intensive orbital physics calculations from the high-performance visualization client.
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}><Activity size={20} color="#00e5ff" style={{ marginTop: '4px' }} /> <strong>FastAPI Backend:</strong> A production-hardened Python server utilizing asymmetric multiprocessing and lifecycle context managers. It powers endpoints like <code>/api/predict</code>, <code>/api/anomaly</code>, and <code>/api/drift</code> with millisecond latency.</li>
                            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}><Code size={20} color="#00e5ff" style={{ marginTop: '4px' }} /> <strong>React 3D Client:</strong> A Vite-powered React frontend managing heavy 3D scenes (SceneManager). It features a robust polling engine with automatic stale-connection detection—if data stops for 15 seconds, it initiates a recursive backoff reconnection sequence.</li>
                        </ul>
                    </div>
                </section>

                {/* Section 2 */}
                <section className="doc-section" style={{ animationDelay: '0.2s', marginTop: '64px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Database size={24} color="#fff" />
                        </div>
                        <h2 style={{ fontSize: '32px', fontWeight: 800, margin: 0 }}>Telemetry Ingestion Pipeline</h2>
                    </div>
                    <div className="ultra-glass-card" style={{ padding: '40px', fontSize: '16px', lineHeight: 1.8, color: '#e2e8f0' }}>
                        <p style={{ marginBottom: '20px' }}>
                            Data reliability is paramount. The system employs a dual-mode ingestion strategy, prioritizing live telemetry from NOAA but maintaining synthetic fallback for uninterrupted operations in high-latency environments.
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}><strong>NOAA SWPC Array:</strong> Real-time integration with fetchers extracting radiation flux, solar wind velocity, and ambient magnetic indices directly from Space Weather Prediction center JSON buffers.</li>
                            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}><strong>CelesTrak Sync:</strong> Hourly background tasks (<code>_tle_refresh_loop</code>) ensure kinetic precision across 5,000+ active objects by refreshing TLE (Two-Line Element) catalogs asynchronously.</li>
                        </ul>
                    </div>
                </section>

                {/* Section 3 */}
                <section className="doc-section" style={{ animationDelay: '0.3s', marginTop: '64px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Cpu size={24} color="#fff" />
                        </div>
                        <h2 style={{ fontSize: '32px', fontWeight: 800, margin: 0 }}>AI Risk Calibrator</h2>
                    </div>
                    <div className="ultra-glass-card" style={{ padding: '40px', fontSize: '16px', lineHeight: 1.8, color: '#e2e8f0' }}>
                        <p style={{ marginBottom: '20px' }}>
                            During server initialization, the <code>SatelliteAIEngine</code> attempts to dynamically calibrate utilizing up to 500 historic NOAA data points. This forms the baseline for the machine learning model.
                        </p>
                        <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '20px', fontFamily: '"Fira Code", monospace', fontSize: '13px', color: '#00e5ff' }}>
                            &gt; Engine Strategy: LSTM Ensemble<br />
                            &gt; Drift Tracking: Continuous /api/drift monitoring<br />
                            &gt; Alert Hierarchy: Critical, High, Medium, Low
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
};

export default DocsPage;
