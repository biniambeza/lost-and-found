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
				setItems(data.items || [])
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
		if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return
		try {
			await api.delete(`/items/${itemId}`)
			setItems((current) => current.filter((item) => item._id !== itemId))
			setStats((current) => (current ? { ...current, items: Math.max(current.items - 1, 0) } : current))
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'The listing could not be deleted.')
		}
	}

	return (
		<div className="page-shell">
			<Navbar />

			<div className="admin-page-container">
				<div className="admin-header-row">
					<div>
						<div className="admin-badge-kicker">
							<span className="admin-badge-dot" />
							<span>SYSTEM ADMINISTRATION</span>
						</div>
						<h1 className="admin-page-title">Community Board Overview</h1>
						<p className="admin-page-subtitle">
							Monitor active reports, manage recovery statuses, and oversee platform activity.
						</p>
					</div>
				</div>

				<nav className="admin-nav-tabs" aria-label="Admin Navigation">
					<Link to="/admin" className="admin-tab is-active" aria-current="page">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
							<polyline points="14 2 14 8 20 8" />
							<line x1="16" y1="13" x2="8" y2="13" />
							<line x1="16" y1="17" x2="8" y2="17" />
						</svg>
						<span>All Reports ({items.length})</span>
					</Link>
					<Link to="/admin/users" className="admin-tab">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
							<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
							<circle cx="9" cy="7" r="4" />
							<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
							<path d="M16 3.13a4 4 0 0 1 0 7.75" />
						</svg>
						<span>User Directory</span>
					</Link>
				</nav>

				{isLoading && (
					<div className="detail-loading-box">
						<div className="btn-spinner large-spinner" />
						<p>Loading dashboard metrics...</p>
					</div>
				)}

				{error && (
					<div className="state-card state-error" role="alert">
						<div className="state-icon">⚠️</div>
						<h3>Dashboard alert</h3>
						<p>{error}</p>
					</div>
				)}

				{stats && (
					<section className="admin-stats-grid" aria-label="Platform Statistics">
						<div className="stat-card stat-users">
							<div className="stat-card-icon">👥</div>
							<div className="stat-card-info">
								<span className="stat-card-label">Total Users</span>
								<strong className="stat-card-number">{stats.users}</strong>
							</div>
						</div>

						<div className="stat-card stat-open">
							<div className="stat-card-icon">🔍</div>
							<div className="stat-card-info">
								<span className="stat-card-label">Active Missing Cases</span>
								<strong className="stat-card-number">{stats.openItems}</strong>
							</div>
						</div>

						<div className="stat-card stat-resolved">
							<div className="stat-card-icon">✨</div>
							<div className="stat-card-info">
								<span className="stat-card-label">Reunited / Resolved</span>
								<strong className="stat-card-number">{stats.resolvedItems}</strong>
							</div>
						</div>

						<div className="stat-card stat-total">
							<div className="stat-card-icon">📦</div>
							<div className="stat-card-info">
								<span className="stat-card-label">Total Items Reported</span>
								<strong className="stat-card-number">{stats.items}</strong>
							</div>
						</div>
					</section>
				)}

				<section className="admin-table-section">
					<div className="table-header-row">
						<h2>Recent Listings Feed</h2>
						<span className="table-count-badge">{items.length} records</span>
					</div>

					<div className="table-responsive-wrapper">
						<table className="admin-data-table">
							<thead>
								<tr>
									<th>Item Details</th>
									<th>Type</th>
									<th>Status</th>
									<th>Reported By</th>
									<th className="text-right">Actions</th>
								</tr>
							</thead>
							<tbody>
								{items.map((item) => (
									<tr key={item._id}>
										<td className="table-item-cell">
											<div className="table-item-thumb">
												{item.photoUrl ? (
													<img src={item.photoUrl} alt="" className="table-thumb-img" />
												) : (
													<span className="table-thumb-fallback">{item.type === 'lost' ? '🔍' : '🎁'}</span>
												)}
											</div>
											<div className="table-item-meta">
												<Link to={`/items/${item._id}`} className="table-item-title">
													{item.title}
												</Link>
												<span className="table-item-sub">
													{item.category} · {item.location}
												</span>
											</div>
										</td>
										<td>
											<span className={`badge-pill badge-${item.type} table-pill`}>
												{item.type}
											</span>
										</td>
										<td>
											<span className={`badge-pill ${item.status === 'resolved' ? 'badge-resolved' : 'badge-active'} table-pill`}>
												{item.status}
											</span>
										</td>
										<td>
											<div className="table-author-cell">
												<span className="author-avatar small">{item.postedBy?.name?.charAt(0).toUpperCase() || 'U'}</span>
												<span>{item.postedBy?.name || 'Removed user'}</span>
											</div>
										</td>
										<td className="text-right">
											<div className="table-actions-cluster">
												<Link to={`/items/${item._id}`} className="table-btn-view" title="Inspect listing">
													View
												</Link>
												<button
													className="table-btn-delete"
													type="button"
													onClick={() => deleteListing(item._id)}
													title="Delete listing"
												>
													Delete
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>

						{!isLoading && items.length === 0 && (
							<div className="table-empty-msg">
								<p>No listings recorded on the board yet.</p>
							</div>
						)}
					</div>
				</section>
			</div>
		</div>
	)
}
