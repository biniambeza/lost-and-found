import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../../shared/components/Button.jsx'
import Navbar from '../../shared/components/Navbar.jsx'
import useAuth from '../../context/useAuth'
import api from '../../services/api'

export default function ItemDetails() {
	const { id } = useParams()
	const navigate = useNavigate()
	const { user } = useAuth()
	const [item, setItem] = useState(null)
	const [error, setError] = useState('')
	const [isLoading, setIsLoading] = useState(true)
	const [isSaving, setIsSaving] = useState(false)

	useEffect(() => {
		const controller = new AbortController()
		api.get(`/items/${id}`, { signal: controller.signal })
			.then(({ data }) => setItem(data.item))
			.catch((requestError) => {
				if (requestError.code !== 'ERR_CANCELED') {
					setError(requestError.response?.data?.message || 'This listing could not be loaded.')
				}
			})
			.finally(() => {
				if (!controller.signal.aborted) setIsLoading(false)
			})
		return () => controller.abort()
	}, [id])

	const posterId = item?.postedBy?._id || item?.postedBy
	const isOwner = Boolean(user && posterId && String(posterId) === String(user.id))
	const isAdmin = user?.role === 'admin'
	const canModerate = isOwner || isAdmin
	const contactEmail = item?.postedBy?.email

	async function markResolved() {
		setError('')
		setIsSaving(true)
		try {
			const { data } = await api.put(`/items/${id}`, { status: 'resolved' })
			setItem(data.item)
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'The listing could not be updated.')
		} finally {
			setIsSaving(false)
		}
	}

	async function deleteListing() {
		if (!window.confirm('Delete this listing? This cannot be undone.')) return
		setError('')
		setIsSaving(true)
		try {
			await api.delete(`/items/${id}`)
			navigate(isAdmin ? '/admin' : '/', { replace: true })
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'The listing could not be deleted.')
			setIsSaving(false)
		}
	}

	return (
		<main className="browse-page">
			<Navbar />
			<div className="detail-back"><Link to="/">← All listings</Link></div>
			{isLoading ? <p className="listing-message">Loading listing...</p> : null}
			{error && !item ? <p className="listing-message listing-error" role="alert">{error}</p> : null}
			{item ? (
				<article className="item-detail">
					{item.photoUrl ? <img className="detail-image" src={item.photoUrl} alt={item.title} /> : <div className="detail-image detail-placeholder" aria-hidden="true">{item.type === 'lost' ? 'L' : 'F'}</div>}
					<div className="detail-copy">
						<p className={`item-type item-type-${item.type}`}>{item.type} item <span>·</span> {item.status}</p>
						<h1>{item.title}</h1>
						<p className="detail-summary">{item.category} <span>·</span> {item.location}</p>
						<p className="detail-description">{item.description}</p>
						<dl className="detail-facts">
							<div><dt>{item.type === 'lost' ? 'Last seen' : 'Found on'}</dt><dd>{new Date(item.date).toLocaleDateString()}</dd></div>
							<div><dt>Posted by</dt><dd>{item.postedBy?.name || 'Community member'}</dd></div>
						</dl>
						{user && !isOwner && contactEmail ? (
							<a className="submit-button resolve-button contact-link" href={`mailto:${contactEmail}?subject=${encodeURIComponent(`Lost & Found: ${item.title}`)}`}>
								Contact {item.postedBy?.name || 'poster'} <span aria-hidden="true">→</span>
							</a>
						) : null}
						{!user ? <p className="detail-hint"><Link to="/login">Sign in</Link> to contact the person who posted this.</p> : null}
						{canModerate && item.status === 'open' ? (
							<Button className="resolve-button" disabled={isSaving} onClick={markResolved}>
								{isSaving ? 'Updating...' : 'Mark as resolved'} <span aria-hidden="true">✓</span>
							</Button>
						) : null}
						{canModerate ? (
							<Button className="resolve-button" variant="secondary" disabled={isSaving} onClick={deleteListing}>
								Delete listing
							</Button>
						) : null}
						{error && item ? <p className="form-error" role="alert">{error}</p> : null}
					</div>
				</article>
			) : null}
			<p className="content-foot detail-foot">LOST &amp; FOUND <span>•</span> A LITTLE CLOSER TO HOME</p>
		</main>
	)
}
