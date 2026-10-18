import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Navbar from '../../shared/components/Navbar.jsx'
import useAuth from '../../context/useAuth'
import api from '../../services/api'

export default function ManageUsers() {
	const { user: currentUser } = useAuth()
	const [users, setUsers] = useState([])
	const [error, setError] = useState('')
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const controller = new AbortController()
		api.get('/admin/users', { signal: controller.signal })
			.then(({ data }) => setUsers(data.users || []))
			.catch((requestError) => {
				if (requestError.code !== 'ERR_CANCELED') {
					setError(requestError.response?.data?.message || 'Users could not be loaded.')
				}
			})
			.finally(() => {
				if (!controller.signal.aborted) setIsLoading(false)
			})
		return () => controller.abort()
	}, [])

	async function changeRole(user, role) {
		setError('')
		try {
			const { data } = await api.patch(`/admin/users/${user._id || user.id}/role`, { role })
			setUsers((current) =>
				current.map((entry) =>
					String(entry._id) === String(data.user.id) ? { ...entry, role: data.user.role } : entry
				)
			)
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'The user role could not be updated.')
		}
	}

	async function removeUser(user) {
		if (!window.confirm(`Are you sure you want to remove ${user.name} and all their posted listings?`)) return
		setError('')
		try {
			await api.delete(`/admin/users/${user._id}`)
			setUsers((current) => current.filter((entry) => entry._id !== user._id))
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'The user could not be removed.')
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
						<h1 className="admin-page-title">User Directory</h1>
						<p className="admin-page-subtitle">
							Manage registered community members, grant moderator privileges, and safeguard platform safety.
						</p>
					</div>
				</div>

				<nav className="admin-nav-tabs" aria-label="Admin Navigation">
					<Link to="/admin" className="admin-tab">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
							<polyline points="14 2 14 8 20 8" />
							<line x1="16" y1="13" x2="8" y2="13" />
							<line x1="16" y1="17" x2="8" y2="17" />
						</svg>
						<span>All Reports</span>
					</Link>
					<Link to="/admin/users" className="admin-tab is-active" aria-current="page">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
							<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
							<circle cx="9" cy="7" r="4" />
							<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
							<path d="M16 3.13a4 4 0 0 1 0 7.75" />
						</svg>
						<span>User Directory ({users.length})</span>
					</Link>
				</nav>

				{isLoading && (
					<div className="detail-loading-box">
						<div className="btn-spinner large-spinner" />
						<p>Loading user list...</p>
					</div>
				)}

				{error && (
					<div className="state-card state-error" role="alert">
						<div className="state-icon">⚠️</div>
						<h3>User directory alert</h3>
						<p>{error}</p>
					</div>
				)}

				<section className="admin-table-section">
					<div className="table-header-row">
						<h2>Registered Members</h2>
						<span className="table-count-badge">{users.length} members</span>
					</div>

					<div className="table-responsive-wrapper">
						<table className="admin-data-table">
							<thead>
								<tr>
									<th>User Name</th>
									<th>Email Address</th>
									<th>Role</th>
									<th>Registration Date</th>
									<th className="text-right">Actions</th>
								</tr>
							</thead>
							<tbody>
								{users.map((itemUser) => {
									const isSelf = String(itemUser._id) === String(currentUser?.id)
									const isAdminRole = itemUser.role === 'admin'

									return (
										<tr key={itemUser._id}>
											<td>
												<div className="table-author-cell">
													<span className="author-avatar">{itemUser.name?.charAt(0).toUpperCase() || 'U'}</span>
													<div>
														<strong className="user-name-cell">{itemUser.name}</strong>
														{isSelf && <span className="user-self-pill">You</span>}
													</div>
												</div>
											</td>
											<td className="table-email-cell">{itemUser.email}</td>
											<td>
												<span className={`badge-pill ${isAdminRole ? 'badge-role-admin' : 'badge-role-user'} table-pill`}>
													{isAdminRole ? '★ Administrator' : 'Member'}
												</span>
											</td>
											<td className="table-date-cell">
												{new Date(itemUser.createdAt).toLocaleDateString(undefined, {
													year: 'numeric',
													month: 'short',
													day: 'numeric',
												})}
											</td>
											<td className="text-right">
												<div className="table-actions-cluster">
													{itemUser.role === 'user' ? (
														<button
															className="table-btn-role"
															type="button"
															onClick={() => changeRole(itemUser, 'admin')}
														>
															Promote to Admin
														</button>
													) : (
														<button
															className="table-btn-role"
															type="button"
															disabled={isSelf}
															onClick={() => changeRole(itemUser, 'user')}
														>
															Demote to User
														</button>
													)}
													<button
														className="table-btn-delete"
														type="button"
														disabled={isSelf}
														onClick={() => removeUser(itemUser)}
														title={isSelf ? 'Cannot remove yourself' : 'Remove user and listings'}
													>
														Remove
													</button>
												</div>
											</td>
										</tr>
									)
								})}
							</tbody>
						</table>

						{!isLoading && users.length === 0 && (
							<div className="table-empty-msg">
								<p>No registered users found.</p>
							</div>
						)}
					</div>
				</section>
			</div>
		</div>
	)
}
