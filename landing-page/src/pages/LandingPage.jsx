import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Grid, AlertTriangle, Bell, Network, Cpu, Megaphone, ChevronRight, ShieldAlert, Sparkles, Orbit, Activity, Database } from 'lucide-react';
import Aurora from '../components/Aurora';

const customStyles = `
  @keyframes borderBeam {
    0%, 100% { offset-distance: 0%; }
    50% { offset-distance: 100%; }
  }
  @keyframes textShine {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
  }
  @keyframes pulseGlow {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.05); }
  }
  @keyframes spinSlow {
    100% { transform: rotate(360deg); }
  }
  @keyframes meteor {
    0% { transform: rotate(215deg) translateX(0); opacity: 1; }
    70% { opacity: 1; }
    100% { transform: rotate(215deg) translateX(-1000px); opacity: 0; }
  }
  @keyframes slideUpFade {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes blinkRed {
    0%, 100% { background: rgba(255, 50, 50, 0.2); border-color: rgba(255, 50, 50, 0.5); box-shadow: 0 0 10px rgba(255,50,50,0.5); }
    50% { background: rgba(255, 50, 50, 0.05); border-color: rgba(255, 50, 50, 0.2); box-shadow: 0 0 0px rgba(255,50,50,0); }
  }
  @keyframes radarSweep {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes scanLine {
    0% { transform: translateY(-100%); opacity: 0; }
    50% { opacity: 0.5; }
    100% { transform: translateY(100%); opacity: 0; }
  }
  @keyframes isometricPing {
    0% { transform: scale(0.8); opacity: 0.5; }
    50% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(0.8); opacity: 0.5; }
  }
  @keyframes spinSlow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .threat-row {
    display: grid;
    grid-template-columns: 1.5fr 1fr 2fr 1fr 1fr;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    transition: background 0.3s ease;
    animation: slideUpFade 0.5s ease-out forwards;
    opacity: 0;
  }
  .threat-row:last-child {
    border-bottom: none;
  }
  .threat-row:hover {
    background: rgba(255,255,255,0.03);
  }
  .severity-critical {
    animation: blinkRed 2s infinite;
    color: #ff3333;
  }
  .severity-warn {
    background: rgba(255, 170, 0, 0.1);
    border: 1px solid rgba(255, 170, 0, 0.3);
    color: #ffaa00;
  }
  .severity-normal {
    background: rgba(0, 229, 255, 0.1);
    border: 1px solid rgba(0, 229, 255, 0.3);
    color: #00e5ff;
  }
  .radar-container {
    width: 280px;
    height: 280px;
    position: relative;
    overflow: hidden;
    background: radial-gradient(circle at center, rgba(0, 229, 255, 0.1) 0%, transparent 70%);
    perspective: 1000px;
  }
  .isometric-plane {
    position: absolute;
    inset: 0;
    transform: rotateX(60deg) rotateZ(0deg);
    transform-style: preserve-3d;
    transition: transform 0.5s ease;
    border-radius: 50%;
  }
  .hud-scanline {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent, rgba(0, 229, 255, 0.1), transparent);
    height: 20%;
    width: 100%;
    animation: scanLine 4s linear infinite;
    pointer-events: none;
    z-index: 20;
  }
  
  .bg-base {
    background-color: #000000;
    min-height: 100vh;
    color: #ffffff;
    font-family: "Inter", -apple-system, sans-serif;
    position: relative;
    overflow-x: hidden;
  }
  
  .grid-overlay {
    position: absolute;
    inset: 0;
    background-size: 50px 50px;
    background-image: 
      linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    mask-image: radial-gradient(ellipse at center, black 0%, transparent 80%);
    -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 80%);
    pointer-events: none;
    z-index: 0;
  }
  
  .ambient-light {
    position: absolute;
    top: -20%;
    left: 50%;
    transform: translateX(-50%);
    width: 80vw;
    height: 600px;
    background: radial-gradient(ellipse at top, rgba(0, 229, 255, 0.15), rgba(112, 0, 255, 0.1), transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .text-gradient-hero {
    background: linear-gradient(to right, #ffffff 20%, #00e5ff 40%, #7000ff 60%, #ffffff 80%);
    background-size: 200% auto;
    color: transparent;
    -webkit-background-clip: text;
    background-clip: text;
    animation: textShine 5s linear infinite;
  }
  
  .badge-premium {
    position: relative;
    background: rgba(0, 0, 0, 0.82);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 99px;
    padding: 8px 20px;
    display: inline-flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
    overflow: hidden;
  }
  .badge-premium::after {
    content: "";
    position: absolute;
    inset: 0;
    margin: -1px;
    border-radius: inherit;
    padding: 1px;
    background: conic-gradient(from 0deg at 50% 50%, transparent 0%, transparent 40%, #00e5ff 50%, transparent 60%, transparent 100%);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    -webkit-mask-composite: destination-out;
    animation: spinSlow 4s linear infinite;
    pointer-events: none;
  }
  .badge-inner {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Ultra Glass Card */
  .ultra-glass-card {
    background: linear-gradient(145deg, rgba(20, 20, 25, 0.4) 0%, rgba(5, 5, 10, 0.8) 100%);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-top: 1px solid rgba(255, 255, 255, 0.15);
    border-left: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 30px 60px -10px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05);
    border-radius: 24px;
    position: relative;
    overflow: hidden;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .ultra-glass-card:hover {
    transform: translateY(-4px);
    border-color: rgba(0, 229, 255, 0.4);
    box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 229, 255, 0.1);
  }

  .btn-primary {
    position: relative;
    background: #ffffff;
    color: #000000;
    border: none;
    border-radius: 12px;
    padding: 16px 36px;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: inline-flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  .btn-primary:hover {
    background: #f3f4f6;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }

  .btn-secondary {
    position: relative;
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(10px);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    padding: 16px 36px;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }
  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  .code-block {
    background: #000000;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 24px;
    font-family: "Fira Code", monospace;
    font-size: 13px;
    color: #e2e8f0;
    box-shadow: inset 0 4px 30px rgba(0,0,0,0.8);
    position: relative;
  }
  .code-block::before {
    content: '';
    position: absolute;
    top: 0; left: 24px; right: 24px; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.4), transparent);
  }

  .meteor-1 { top: 10%; right: 10%; animation-delay: 0s; }
  .meteor-2 { top: 30%; right: 20%; animation-delay: 2s; }
  .meteor-3 { top: 5%; right: 40%; animation-delay: 1.5s; }
`;

const LandingPage = () => {
  const navigate = useNavigate();

  // Spotlight effect logic for cards
  useEffect(() => {
    const handleMouseMove = (e) => {
      const cards = document.querySelectorAll('.ultra-glass-card');
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const textMuted = '#94a3b8';

  return (
    <div className="bg-base">
      <style>{customStyles}</style>

      <div className="grid-overlay" />
      <div className="ambient-light" />

      {/* Pure CSS Meteors */}
      <div className="meteor meteor-1"></div>
      <div className="meteor meteor-2"></div>
      <div className="meteor meteor-3"></div>

      {/* Premium Navbar Container */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 50,
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
          <span style={{ cursor: 'pointer', transition: 'color 0.2s', color: '#fff' }} onClick={() => navigate('/docs')}></span>
        </div>

        <button
          onClick={() => navigate('/docs')}
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
          View Documentation
        </button>
      </nav>

      {/* Hackathon Winning Hero */}
      <section style={{
        position: 'relative', minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center', padding: '0 20px',
        overflow: 'hidden'
      }}>

        {/* Dynamic WebGL Aurora Background */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.8 }}>
          <Aurora colorStops={['#000000', '#00e5ff', '#0077ff']} amplitude={1.2} speed={0.5} />
        </div>

        {/* 3D-feeling Earth Base - Opacity strictly at 82% */}
        <div style={{
          position: 'absolute', top: '15%', left: '50%', marginLeft: '-400px',
          width: '800px', height: '800px', pointerEvents: 'none', zIndex: 0,
          animation: 'float 12s ease-in-out infinite'
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `url('https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80') center / cover`,
            opacity: 0.82,
            maskImage: 'radial-gradient(circle at 50% 50%, black 0%, transparent 65%)',
            WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 0%, transparent 65%)',
            mixBlendMode: 'screen',
            borderRadius: '50%'
          }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>


          {/* Gradient Typography */}
          <h1 style={{ fontSize: '84px', fontWeight: 900, lineHeight: 1.05, margin: '0 0 24px 0', letterSpacing: '-0.04em', zIndex: 10, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.8))' }}>
            Orbital intelligence,<br />
            <span className="text-gradient-hero">beautifully unified.</span>
          </h1>

          <p style={{ fontSize: '20px', color: '#cbd5e1', maxWidth: '700px', margin: '0 0 48px 0', lineHeight: 1.6, fontWeight: 400, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }}>
            The command center for the modern space economy. Sentinel fuses raw telemetry from NOAA and CelesTrak into proactive, deterministic risk insights.
          </p>

          {/* Premium Buttons */}
          <div style={{ display: 'flex', gap: '24px' }}>
            <button className="btn-primary" onClick={() => navigate('/docs')}>
              <Database size={18} />
              System Architecture
            </button>
            <button className="btn-secondary" onClick={() => window.open('http://localhost:8000', '_blank')}>
              <Grid size={18} />
              Mission Console
            </button>
          </div>
        </div>
      </section>

      {/* Global Threat Telemetry Dashboard */}
      <section style={{ padding: '80px 48px 120px 48px', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
            <div>
              <h2 style={{ fontSize: '42px', fontWeight: 800, margin: '0 0 12px 0', letterSpacing: '-1px', textShadow: '0 10px 20px rgba(0,0,0,0.5)' }}>Global Threat Telemetry.</h2>
              <p style={{ color: textMuted, fontSize: '18px', maxWidth: '600px', margin: 0, lineHeight: 1.6 }}>Live ingestion from global orbital arrays, intercepting critical signatures before they become incidents.</p>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#00e5ff', fontSize: '14px', fontWeight: 700, letterSpacing: '1px', background: 'rgba(0,229,255,0.05)', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(0,229,255,0.2)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00e5ff', boxShadow: '0 0 10px #00e5ff', animation: 'pulseGlow 2s infinite' }} />
                LIVE FEED ACTIVE
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

              {/* Live Feed Table */}
              <div className="ultra-glass-card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 2fr 1fr 1fr', padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: textMuted, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <span>Target Asset</span>
                  <span>NORAD ID</span>
                  <span>Anomaly Signature</span>
                  <span>Risk ETA</span>
                  <span>Status Code</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {[
                    { target: 'ISS (Zarya Mod)', id: '25544', sig: 'Micrometeoroid trajectory intersection risk 84%', eta: 'T- 14m 22s', status: 'CRITICAL', cl: 'severity-critical' },
                    { target: 'Starlink-1022', id: '45173', sig: 'Geomagnetic radiation spike detected', eta: 'T- 02h 45m', status: 'WARN', cl: 'severity-warn' },
                    { target: 'Hubble Telescope', id: '20580', sig: 'Mechanical thermal stress variance', eta: 'T- 08h 12m', status: 'MONITOR', cl: 'severity-normal' },
                    { target: 'Sentinel-6A', id: '46984', sig: 'Orbital decay acceleration above threshold', eta: 'T- 44h 00m', status: 'WARN', cl: 'severity-warn' },
                    { target: 'GOES-16 Array', id: '41866', sig: 'Standard operating telemetry confirmed', eta: '--', status: 'NOMINAL', cl: 'severity-normal' },
                  ].map((item, i) => (
                    <div key={i} className="threat-row" style={{ animationDelay: `${i * 0.15}s` }}>
                      <div style={{ fontWeight: 600, fontSize: '15px' }}>{item.target}</div>
                      <div style={{ fontFamily: '"Fira Code", monospace', color: textMuted, fontSize: '13px' }}>#{item.id}</div>
                      <div style={{ color: '#cbd5e1', fontSize: '14px' }}>{item.sig}</div>
                      <div style={{ fontFamily: '"Fira Code", monospace', fontSize: '14px', color: item.status === 'CRITICAL' ? '#ff3333' : '#e2e8f0' }}>{item.eta}</div>
                      <div>
                        <span className={item.cl} style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Countermeasures */}
              <div className="ultra-glass-card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={18} color="#00e5ff" />
                    Active Countermeasures
                  </h3>
                  <span style={{ fontSize: '12px', color: textMuted, fontFamily: '"Fira Code", monospace' }}>SYS.OP.MODE: AUTO</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ color: textMuted, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Orbital Shift (LEO)</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>+2.4<span style={{ fontSize: '14px', color: textMuted, fontWeight: 500 }}>deg</span></div>
                    <div style={{ fontSize: '11px', color: '#00e5ff', fontFamily: '"Fira Code", monospace' }}>Executing burn sequence</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ color: textMuted, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Debris Deflection</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>84<span style={{ fontSize: '14px', color: textMuted, fontWeight: 500 }}>objs</span></div>
                    <div style={{ fontSize: '11px', color: '#00e5ff', fontFamily: '"Fira Code", monospace' }}>Lasers armed & tracking</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ color: textMuted, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Solar Shielding</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>100<span style={{ fontSize: '14px', color: textMuted, fontWeight: 500 }}>%</span></div>
                    <div style={{ fontSize: '11px', color: '#00e5ff', fontFamily: '"Fira Code", monospace' }}>Polarity stabilized</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Radar/Stats Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div className="ultra-glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <div className="radar-container" style={{ border: '1px solid rgba(0,229,255,0.2)', borderRadius: '16px', boxShadow: '0 0 30px rgba(0,229,255,0.1)' }}>
                  <div className="hud-scanline" />

                  <div className="isometric-plane">
                    {/* Orbital Shells */}
                    <div style={{ position: 'absolute', inset: '5%', border: '1px solid rgba(0, 229, 255, 0.2)', borderRadius: '50%' }}>
                      <span style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'rotateX(-60deg) translateX(-50%)', color: 'rgba(0,229,255,0.4)', fontSize: '9px', fontWeight: 800 }}>GEO 35,786KM</span>
                    </div>
                    <div style={{ position: 'absolute', inset: '25%', border: '1px dashed rgba(0, 229, 255, 0.15)', borderRadius: '50%', animation: 'spinSlow 30s linear infinite' }} />
                    <div style={{ position: 'absolute', inset: '45%', border: '1px solid rgba(0, 229, 255, 0.25)', borderRadius: '50%' }}>
                      <span style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'rotateX(-60deg) translateX(-50%)', color: 'rgba(0,229,255,0.4)', fontSize: '9px', fontWeight: 800 }}>MEO 2,000KM</span>
                    </div>
                    <div style={{ position: 'absolute', inset: '65%', border: '1px dashed rgba(0, 229, 255, 0.2)', borderRadius: '50%', animation: 'spinSlow 20s linear infinite reverse' }} />

                    {/* Crosshairs on plane */}
                    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(0, 229, 255, 0.1)' }} />
                    <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(0, 229, 255, 0.1)' }} />

                    {/* Isometric Targets with Altitude Stems */}
                    <div style={{ position: 'absolute', top: '25%', left: '30%', transformStyle: 'preserve-3d' }}>
                      <div style={{ width: '1px', height: '60px', background: 'linear-gradient(to top, #ff3333, transparent)', position: 'absolute', bottom: 0, left: 3, transform: 'rotateX(-60deg)', transformOrigin: 'bottom' }} />
                      <div style={{ position: 'absolute', bottom: '60px', left: '0', transform: 'rotateX(-60deg) translateY(-20px)', animation: 'isometricPing 2s infinite' }}>
                        <div style={{ width: 8, height: 8, background: '#ff3333', borderRadius: '50%', boxShadow: '0 0 15px #ff3333' }} />
                        <div style={{ position: 'absolute', left: 12, top: -4, whiteSpace: 'nowrap', color: '#ff3333', fontSize: '10px', fontWeight: 800, fontFamily: '"Fira Code", monospace', background: 'rgba(0,0,0,0.8)', padding: '2px 6px', border: '1px solid #ff3333', borderRadius: '4px' }}>
                          [CRITICAL] ISS_ZARYA
                        </div>
                      </div>
                    </div>

                    <div style={{ position: 'absolute', top: '60%', right: '25%', transformStyle: 'preserve-3d' }}>
                      <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to top, #ffaa00, transparent)', position: 'absolute', bottom: 0, left: 3, transform: 'rotateX(-60deg)', transformOrigin: 'bottom' }} />
                      <div style={{ position: 'absolute', bottom: '40px', left: '0', transform: 'rotateX(-60deg) translateY(-10px)' }}>
                        <div style={{ width: 6, height: 6, background: '#ffaa00', borderRadius: '50%', boxShadow: '0 0 10px #ffaa00' }} />
                        <div style={{ position: 'absolute', left: 10, top: -4, whiteSpace: 'nowrap', color: '#ffaa00', fontSize: '9px', fontWeight: 700, fontFamily: '"Fira Code", monospace' }}>
                          TRK: STARLINK-1022
                        </div>
                      </div>
                    </div>

                    <div style={{ position: 'absolute', bottom: '20%', left: '45%', transformStyle: 'preserve-3d' }}>
                      <div style={{ width: '1px', height: '30px', background: 'linear-gradient(to top, #00e5ff, transparent)', position: 'absolute', bottom: 0, left: 2, transform: 'rotateX(-60deg)', transformOrigin: 'bottom' }} />
                      <div style={{ position: 'absolute', bottom: '30px', left: '0', transform: 'rotateX(-60deg) translateY(-5px)' }}>
                        <div style={{ width: 4, height: 4, background: '#00e5ff', borderRadius: '50%', boxShadow: '0 0 10px #00e5ff' }} />
                      </div>
                    </div>
                  </div>

                  {/* Sweeping Radar Beam */}
                  <div style={{ position: 'absolute', inset: 0, background: 'conic-gradient(from 0deg, transparent 60%, rgba(0, 229, 255, 0.3) 100%)', borderRadius: '50%', animation: 'radarSweep 4s linear infinite', zIndex: 10, pointerEvents: 'none' }} />
                </div>

                <div style={{ marginTop: '32px', textAlign: 'center', width: '100%', padding: '0 10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', color: textMuted, fontWeight: 700, letterSpacing: '2px', textAlign: 'left', lineHeight: 1.4 }}>ISOMETRIC<br />COMMAND</div>
                    <div style={{ fontSize: '32px', fontWeight: 700, fontFamily: '"Fira Code", monospace', letterSpacing: '-1px', color: '#00e5ff', textShadow: '0 0 15px rgba(0,229,255,0.4)', margin: 0 }}>8,492 <span style={{ fontSize: '13px', color: textMuted, fontWeight: 500, letterSpacing: 'normal', textShadow: 'none' }}>OBJS</span></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, fontFamily: '"Fira Code", monospace', color: textMuted }}>
                    <span>COORD <span style={{ color: '#fff' }}>+42.82</span></span>
                    <span>ALT <span style={{ color: '#fff' }}>420KM</span></span>
                    <span>STATUS <span style={{ color: '#00e5ff' }}>LOCKED</span></span>
                  </div>
                </div>
              </div>

              <div className="ultra-glass-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 24px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>Network Latency</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {[
                    { label: 'NOAA Swarm Array', val: '98.5%', color: '#00e5ff' },
                    { label: 'CelesTrak Sync', val: '42ms', color: '#00e5ff' },
                    { label: 'LSTM Inference', val: '12ms', color: '#ffaa00' }
                  ].map((stat, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: textMuted, fontSize: '14px', fontWeight: 500 }}>{stat.label}</span>
                      <span style={{ color: stat.color, fontSize: '15px', fontWeight: 700, fontFamily: '"Fira Code", monospace' }}>{stat.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Minimalist Footer */}
      <footer style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '40px 48px', borderTop: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(20px)', zIndex: 10, position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '14px', color: '#cbd5e1' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#00e5ff', boxShadow: '0 0 12px #00e5ff' }} />
          <span>ASTRO_SENTINEL</span>
        </div>
        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
          © 2024. Next-Gen Space Operations.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
