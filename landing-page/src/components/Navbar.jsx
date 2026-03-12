import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
    return (
        <header className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="logo">
                    <div className="logo-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0b0f18" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    </div>
                    <span className="logo-text">ASTRO_SENTINEL</span>
                </Link>
                <nav>
                    <ul className="nav-links">
                        <li><NavLink to="/dashboard" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>Dashboard</NavLink></li>
                        <li><NavLink to="/alerts" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>Alerts</NavLink></li>
                    </ul>
                </nav>
                <Link to="/dashboard" className="btn-primary" style={{ marginLeft: 'auto', padding: '7px 18px', fontSize: '12px' }}>
                    Open Dashboard
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                </Link>
            </div>
        </header>
    );
}
