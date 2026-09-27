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
			.then(({ data }) => setUsers(data.users))
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
			setUsers((current) => current.map((entry) => (
				String(entry._id) === String(data.user.id) ? { ...entry, role: data.user.role } : entry
			)))
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'The role could not be updated.')
		}
	}

	async function removeUser(user) {
		if (!window.confirm(`Remove ${user.name} and their listings?`)) return
		setError('')
		try {
			await api.delete(`/admin/users/${user._id}`)
			setUsers((current) => current.filter((entry) => entry._id !== user._id))
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'The user could not be removed.')
		}
	}

	return (
		<main className="browse-page">
			<Navbar />
			<section className="browse-heading">
				<p className="browse-kicker">ADMINISTRATION</p>
				<h1>Manage users</h1>
				<p>Promote administrators, or remove accounts that should not remain on the board.</p>
			</section>
			<nav className="admin-subnav">
				<Link to="/admin">Reports</Link>
				<Link to="/admin/users" aria-current="page">Users</Link>
			</nav>
			{isLoading ? <p className="listing-message">Loading users...</p> : null}
			{error ? <p className="listing-message listing-error" role="alert">{error}</p> : null}
			<div className="admin-table-wrap">
				<table className="admin-table">
					<thead>
						<tr>
							<th>Name</th>
							<th>Email</th>
							<th>Role</th>
							<th>Joined</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{users.map((user) => {
							const isSelf = String(user._id) === String(currentUser?.id)
							return (
								<tr key={user._id}>
									<td>{user.name}{isSelf ? ' (you)' : ''}</td>
									<td>{user.email}</td>
									<td>{user.role}</td>
									<td>{new Date(user.createdAt).toLocaleDateString()}</td>
									<td className="admin-actions">
										{user.role === 'user' ? (
											<button className="nav-action" type="button" onClick={() => changeRole(user, 'admin')}>Make admin</button>
										) : (
											<button className="nav-action" type="button" disabled={isSelf} onClick={() => changeRole(user, 'user')}>Make user</button>
										)}
										<button className="nav-action" type="button" disabled={isSelf} onClick={() => removeUser(user)}>Remove</button>
									</td>
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>
		</main>
	)
}
