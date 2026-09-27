import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Navbar from '../../shared/components/Navbar.jsx'
import api from '../../services/api'

export default function AdminDashboard() {
	const [stats, setStats] = useState(null)
	const [items, setItems] = useState([])
	const [error, setError] = useState('')
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const controller = new AbortController()
		api.get('/admin/dashboard', { signal: controller.signal })
			.then(({ data }) => {
				setStats(data.stats)
				setItems(data.items)
			})
			.catch((requestError) => {
				if (requestError.code !== 'ERR_CANCELED') {
					setError(requestError.response?.data?.message || 'The admin dashboard could not be loaded.')
				}
			})
			.finally(() => {
				if (!controller.signal.aborted) setIsLoading(false)
			})
		return () => controller.abort()
	}, [])

	async function deleteListing(itemId) {
		if (!window.confirm('Delete this listing?')) return
		try {
			await api.delete(`/items/${itemId}`)
			setItems((current) => current.filter((item) => item._id !== itemId))
			setStats((current) => current ? { ...current, items: Math.max(current.items - 1, 0) } : current)
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'The listing could not be deleted.')
		}
	}

	return (
		<main className="browse-page">
			<Navbar />
			<section className="browse-heading">
				<p className="browse-kicker">ADMINISTRATION</p>
				<h1>Community board overview</h1>
				<p>Review listings, moderate reports, and manage who can post.</p>
			</section>
			<nav className="admin-subnav">
				<Link to="/admin" aria-current="page">Reports</Link>
				<Link to="/admin/users">Users</Link>
			</nav>
			{isLoading ? <p className="listing-message">Loading dashboard...</p> : null}
			{error ? <p className="listing-message listing-error" role="alert">{error}</p> : null}
			{stats ? (
				<section className="stat-grid" aria-label="Board totals">
					<article><p>Users</p><strong>{stats.users}</strong></article>
					<article><p>Open listings</p><strong>{stats.openItems}</strong></article>
					<article><p>Resolved</p><strong>{stats.resolvedItems}</strong></article>
					<article><p>All reports</p><strong>{stats.items}</strong></article>
				</section>
			) : null}
			<section className="listing-section">
				<div className="listing-section-heading">
					<h2>All reports</h2>
					<span>{items.length} shown</span>
				</div>
				<div className="admin-table-wrap">
					<table className="admin-table">
						<thead>
							<tr>
								<th>Item</th>
								<th>Type</th>
								<th>Status</th>
								<th>Posted by</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{items.map((item) => (
								<tr key={item._id}>
									<td>
										<Link to={`/items/${item._id}`}>{item.title}</Link>
										<p>{item.category} · {item.location}</p>
									</td>
									<td className={`item-type item-type-${item.type}`}>{item.type}</td>
									<td>{item.status}</td>
									<td>{item.postedBy?.name || 'Removed user'}</td>
									<td>
										<button className="nav-action" type="button" onClick={() => deleteListing(item._id)}>Delete</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
					{!isLoading && items.length === 0 ? <p className="listing-message">No listings yet.</p> : null}
				</div>
			</section>
		</main>
	)
}
