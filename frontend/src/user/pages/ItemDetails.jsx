import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../../shared/components/Button.jsx'
import Navbar from '../../shared/components/Navbar.jsx'
import useAuth from '../../context/useAuth'
import api from '../../services/api'

const categoryIcons = {
	Electronics: '💻',
	'IDs & Documents': '📄',
	Keys: '🔑',
	'Bags & Wallets': '🎒',
	Clothing: '👕',
	Pets: '🐾',
	Jewelry: '💍',
	Other: '📦',
}

function formatDate(dateString) {
	if (!dateString) return 'Not specified'
	const date = new Date(dateString)
	if (Number.isNaN(date.getTime())) return 'Not specified'
	return date.toLocaleDateString(undefined, {
		weekday: 'short',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
}

export default function ItemDetails() {
	const { id } = useParams()
	const navigate = useNavigate()
	const { user } = useAuth()
	const [item, setItem] = useState(null)
	const [error, setError] = useState('')
	const [isLoading, setIsLoading] = useState(true)
	const [isSaving, setIsSaving] = useState(false)
	const [copied, setCopied] = useState(false)

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
		if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return
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

	function handleShare() {
		navigator.clipboard.writeText(window.location.href)
		setCopied(true)
		setTimeout(() => setCopied(false), 2200)
	}

	const icon = item ? categoryIcons[item.category] || '📦' : '📦'
	const isLost = item?.type === 'lost'
	const isResolved = item?.status === 'resolved'

	return (
		<div className="page-shell">
			<Navbar />

			<div className="detail-container">
				<nav className="detail-breadcrumb" aria-label="Breadcrumb">
					<Link to="/" className="breadcrumb-back">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
							<line x1="19" y1="12" x2="5" y2="12" />
							<polyline points="12 19 5 12 12 5" />
						</svg>
						<span>Back to all listings</span>
					</Link>
					{item && <span className="breadcrumb-current">/ {item.title}</span>}
				</nav>

				{isLoading && (
					<div className="detail-loading-box">
						<div className="btn-spinner large-spinner" />
						<p>Retrieving listing details...</p>
					</div>
				)}

				{error && !item && (
					<div className="state-card state-error" role="alert">
						<div className="state-icon">⚠️</div>
						<h3>Listing not found</h3>
						<p>{error}</p>
						<Link to="/" className="btn-primary">Return to Homepage</Link>
					</div>
				)}

				{item && (
					<article className="detail-card">
						<div className="detail-grid">
							{/* Left Column: Visual Showcase & Safety Tips */}
							<div className="detail-visual-col">
								<div className="detail-image-card">
									{item.photoUrl ? (
										<img className="detail-hero-image" src={item.photoUrl} alt={item.title} />
									) : (
										<div className={`detail-fallback detail-fallback-${item.type}`} aria-hidden="true">
											<div className="detail-fallback-glow" />
											<span className="detail-fallback-emoji">{icon}</span>
											<span className="detail-fallback-text">{isLost ? 'Missing Item' : 'Found Item'}</span>
										</div>
									)}

									<div className="detail-image-badges">
										<span className={`badge-pill badge-${item.type}`}>
											<span className="badge-pulse" />
											{isLost ? 'Lost Item' : 'Found Item'}
										</span>
										<span className={`badge-pill ${isResolved ? 'badge-resolved' : 'badge-active'}`}>
											{isResolved ? '✓ Case Resolved' : '● Currently Active'}
										</span>
									</div>
								</div>

								{/* Safety Tips Card */}
								<div className="safety-tips-card">
									<div className="safety-header">
										<span className="safety-icon">🛡️</span>
										<h4>Safe Exchange Guidelines</h4>
									</div>
									<ul className="safety-list">
										<li>Meet in a busy, well-lit public area (e.g. transit station, cafe).</li>
										<li>Verify unique identifying marks, serial numbers, or passcodes.</li>
										<li>Never transfer money or share sensitive credentials to claim an item.</li>
									</ul>
								</div>
							</div>

							{/* Right Column: Key Details & Actions */}
							<div className="detail-info-col">
								<div className="detail-header-block">
									<div className="detail-tags-row">
										<span className="category-tag-pill">
											<span>{icon}</span>
											<span>{item.category}</span>
										</span>
										<button type="button" className="btn-share" onClick={handleShare} title="Copy link to clipboard">
											<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
												<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
												<polyline points="16 6 12 2 8 6" />
												<line x1="12" y1="2" x2="12" y2="15" />
											</svg>
											<span>{copied ? 'Link Copied! ✨' : 'Share Listing'}</span>
										</button>
									</div>

									<h1 className="detail-main-title">{item.title}</h1>
								</div>

								{/* Metadata Grid */}
								<div className="detail-meta-grid">
									<div className="meta-tile">
										<span className="meta-tile-label">
											<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
												<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
												<circle cx="12" cy="10" r="3" />
											</svg>
											<span>Location</span>
										</span>
										<strong className="meta-tile-value">{item.location}</strong>
									</div>

									<div className="meta-tile">
										<span className="meta-tile-label">
											<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
												<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
												<line x1="16" y1="2" x2="16" y2="6" />
												<line x1="8" y1="2" x2="8" y2="6" />
												<line x1="3" y1="10" x2="21" y2="10" />
											</svg>
											<span>{isLost ? 'Date Missing' : 'Date Discovered'}</span>
										</span>
										<strong className="meta-tile-value">{formatDate(item.date)}</strong>
									</div>

									<div className="meta-tile">
										<span className="meta-tile-label">
											<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
												<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
												<circle cx="12" cy="7" r="4" />
											</svg>
											<span>Reported By</span>
										</span>
										<strong className="meta-tile-value">{item.postedBy?.name || 'Community Member'}</strong>
									</div>

									<div className="meta-tile">
										<span className="meta-tile-label">
											<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
												<circle cx="12" cy="12" r="10" />
												<polyline points="12 6 12 12 16 14" />
											</svg>
											<span>Status</span>
										</span>
										<strong className="meta-tile-value capitalize">{item.status}</strong>
									</div>
								</div>

								{/* Description Card */}
								<div className="detail-desc-box">
									<h2 className="desc-heading">Item Description &amp; Identifying Details</h2>
									<p className="desc-text">{item.description}</p>
								</div>

								{/* Action Trigger Area */}
								<div className="detail-action-card">
									{user && !isOwner && contactEmail && (
										<a
											className="btn-primary detail-action-btn"
											href={`mailto:${contactEmail}?subject=${encodeURIComponent(`Lost & Found: ${item.title}`)}&body=${encodeURIComponent(`Hi ${item.postedBy?.name || ''},\n\nI saw your listing on FindIt for "${item.title}" (${window.location.href}).\n\n`)}`}
										>
											<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
												<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
												<polyline points="22,6 12,13 2,6" />
											</svg>
											<span>Contact {item.postedBy?.name || 'Poster'}</span>
										</a>
									)}

									{!user && (
										<div className="detail-auth-prompt">
											<div className="prompt-text">
												<strong>Have information about this item?</strong>
												<p>Sign in to contact the person who reported this listing.</p>
											</div>
											<Link to="/login" className="btn-primary">
												Sign In to Contact
											</Link>
										</div>
									)}

									{canModerate && (
										<div className="moderator-actions-bar">
											<span className="moderator-label">
												{isOwner ? 'Manage your listing:' : 'Administrator controls:'}
											</span>
											<div className="moderator-btn-group">
												{item.status === 'open' && (
													<Button variant="success" isLoading={isSaving} onClick={markResolved}>
														Mark as Resolved ✓
													</Button>
												)}
												<Button variant="danger" isLoading={isSaving} onClick={deleteListing}>
													Delete Listing
												</Button>
											</div>
										</div>
									)}

									{error && <p className="form-error mt-3" role="alert">{error}</p>}
								</div>
							</div>
						</div>
					</article>
				)}
			</div>
		</div>
	)
}
