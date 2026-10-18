import { Link } from 'react-router-dom'

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
	if (!dateString) return ''
	const date = new Date(dateString)
	if (Number.isNaN(date.getTime())) return ''
	return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ItemCard({ item }) {
	const icon = categoryIcons[item.category] || '📦'
	const isLost = item.type === 'lost'
	const isResolved = item.status === 'resolved'

	return (
		<article className={`item-card ${isLost ? 'card-lost' : 'card-found'} ${isResolved ? 'card-resolved' : ''}`}>
			<Link className="item-card-link" to={`/items/${item._id}`}>
				<div className="item-card-image-wrapper">
					{item.photoUrl ? (
						<img src={item.photoUrl} alt={item.title} loading="lazy" className="item-card-img" />
					) : (
						<div className={`item-card-fallback item-card-fallback-${item.type}`} aria-hidden="true">
							<div className="fallback-glow" />
							<span className="fallback-category-icon">{icon}</span>
							<span className="fallback-tag">{isLost ? 'Missing Item' : 'Found Item'}</span>
						</div>
					)}
					<div className="item-card-badges">
						<span className={`badge-pill badge-${item.type}`}>
							<span className="badge-pulse" />
							{isLost ? 'Lost' : 'Found'}
						</span>
						{isResolved ? (
							<span className="badge-pill badge-resolved">
								<svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
									<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
								</svg>
								Resolved
							</span>
						) : (
							<span className="badge-pill badge-category">
								<span className="cat-emoji">{icon}</span>
								<span>{item.category}</span>
							</span>
						)}
					</div>
				</div>

				<div className="item-card-body">
					<h3 className="item-card-title" title={item.title}>
						{item.title}
					</h3>

					<p className="item-card-description">{item.description}</p>

					<div className="item-card-info-row">
						<span className="item-card-location" title={item.location}>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
								<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
								<circle cx="12" cy="10" r="3" />
							</svg>
							<span>{item.location}</span>
						</span>
						{item.date && (
							<span className="item-card-date">
								<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
									<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
									<line x1="16" y1="2" x2="16" y2="6" />
									<line x1="8" y1="2" x2="8" y2="6" />
									<line x1="3" y1="10" x2="21" y2="10" />
								</svg>
								<span>{formatDate(item.date)}</span>
							</span>
						)}
					</div>

					<div className="item-card-footer">
						<div className="item-card-author">
							<span className="author-avatar">{item.postedBy?.name?.charAt(0).toUpperCase() || 'C'}</span>
							<span className="author-name">{item.postedBy?.name || 'Community member'}</span>
						</div>
						<span className="item-card-action">
							<span>Details</span>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
								<polyline points="9 18 15 12 9 6" />
							</svg>
						</span>
					</div>
				</div>
			</Link>
		</article>
	)
}
