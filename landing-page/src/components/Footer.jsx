export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-inner">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="logo-icon" style={{ width: 24, height: 24, borderRadius: 6 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0b0f18" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L4 7l8 5 8-5-8-5z" /><path d="M4 17l8 5 8-5" /><path d="M4 12l8 5 8-5" />
                        </svg>
                    </div>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--gray)' }}>ASTRO_SENTINEL</span>
                </div>
                <div style={{ display: 'flex', gap: 20 }}>
                    {['Privacy Policy', 'Terms of Service', 'Documentation'].map(l => (
                        <a key={l} href="#" style={{ fontSize: 11, color: 'var(--gray)', textDecoration: 'none', transition: 'color .2s' }}
                            onMouseOver={e => e.target.style.color = 'var(--text2)'} onMouseOut={e => e.target.style.color = 'var(--gray)'}>{l}</a>
                    ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div className="footer-status mono" style={{ fontSize: 10, color: 'var(--text2)' }}>
                        <span className="status-dot" style={{ background: 'var(--green)', width: 7, height: 7, borderRadius: '50%', display: 'inline-block', marginRight: 5 }}></span>
                        MAINFRAME LINK: SECURE
                    </div>
                    <div className="footer-status mono" style={{ fontSize: 10, color: 'var(--text2)' }}>
                        <span className="status-dot" style={{ background: 'var(--cyan)', width: 7, height: 7, borderRadius: '50%', display: 'inline-block', marginRight: 5 }}></span>
                        LAT: 24MS
                    </div>
                </div>
            </div>
            <div style={{ maxWidth: 1280, margin: '12px auto 0', paddingTop: 12, borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: 11, color: 'var(--gray)' }}>
                © 2024 ASTRO_SENTINEL Global Monitoring Network &nbsp;•&nbsp; Terms of Access &nbsp;•&nbsp; Security Protocol
            </div>
        </footer>
    );
}
