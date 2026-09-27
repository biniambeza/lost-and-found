import { Link, NavLink } from 'react-router-dom'
import useAuth from '../../context/useAuth'

export default function Navbar() {
	const { user, logout } = useAuth()

	return (
		<header className="site-header">
			<Link className="site-brand" to="/">
				<span className="site-brand-mark">L</span>
				<span>found / still waiting</span>
			</Link>
			<nav className="site-nav" aria-label="Main navigation">
				<NavLink to="/" end>Listings</NavLink>
				{user ? <NavLink to="/report">Report an item</NavLink> : null}
				{user?.role === 'admin' ? <NavLink to="/admin">Admin</NavLink> : null}
				{user ? (
					<>
						<span className="nav-user">{user.name}</span>
						<button className="nav-action" type="button" onClick={logout}>Sign out</button>
					</>
				) : (
					<>
						<Link to="/login">Sign in</Link>
						<Link className="nav-join" to="/signup">Join</Link>
					</>
				)}
			</nav>
		</header>
	)
}
