import { Link, NavLink } from 'react-router-dom'
import useAuth from '../../context/useAuth'
import ThemeToggle from './ThemeToggle.jsx'

export default function Navbar() {
	const { user, logout } = useAuth()

	return (
		<header className="site-header">
			<Link className="site-brand" to="/">
				<div className="site-brand-logo">
					<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
						<circle cx="11" cy="11" r="7" />
						<line x1="21" y1="21" x2="16.65" y2="16.65" />
						<path d="M11 8v6M8 11h6" strokeWidth="1.8" />
					</svg>
				</div>
				<div className="site-brand-text">
					<span className="site-brand-name">FindIt</span>
					<span className="site-brand-tagline">Lost &amp; Found Community</span>
				</div>
			</Link>

			<nav className="site-nav" aria-label="Main navigation">
				<NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
					<span>Explore</span>
				</NavLink>

				{user?.role === 'admin' && (
					<NavLink to="/admin" className={({ isActive }) => `nav-link nav-admin ${isActive ? 'active' : ''}`}>
						<span className="admin-badge-dot" />
						<span>Admin</span>
					</NavLink>
				)}

				<ThemeToggle />

				{user ? (
					<div className="nav-user-cluster">
						<NavLink to="/report" className="nav-btn-cta">
							<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
								<line x1="12" y1="5" x2="12" y2="19" />
								<line x1="5" y1="12" x2="19" y2="12" />
							</svg>
							<span>Post Item</span>
						</NavLink>
						<div className="nav-user-pill" title={`Signed in as ${user.name}`}>
							<span className="nav-user-avatar">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
							<span className="nav-user-name">{user.name}</span>
						</div>
						<button className="nav-btn-logout" type="button" onClick={logout} title="Sign out">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
								<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
								<polyline points="16 17 21 12 16 7" />
								<line x1="21" y1="12" x2="9" y2="12" />
							</svg>
							<span className="logout-text">Sign out</span>
						</button>
					</div>
				) : (
					<div className="nav-guest-cluster">
						<Link className="nav-btn-ghost" to="/login">Sign in</Link>
						<Link className="nav-btn-primary" to="/signup">
							<span>Join Community</span>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
								<polyline points="9 18 15 12 9 6" />
							</svg>
						</Link>
					</div>
				)}
			</nav>
		</header>
	)
}
