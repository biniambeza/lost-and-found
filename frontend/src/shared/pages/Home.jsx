import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ItemCard from '../components/ItemCard.jsx'
import Navbar from '../components/Navbar.jsx'
import api from '../../services/api'

const categories = [
	{ id: '', label: 'All Categories', icon: '✨' },
	{ id: 'Electronics', label: 'Electronics', icon: '💻' },
	{ id: 'Keys', label: 'Keys', icon: '🔑' },
	{ id: 'Bags & Wallets', label: 'Bags & Wallets', icon: '🎒' },
	{ id: 'Pets', label: 'Pets', icon: '🐾' },
	{ id: 'IDs & Documents', label: 'Documents', icon: '📄' },
	{ id: 'Clothing', label: 'Clothing', icon: '👕' },
	{ id: 'Jewelry', label: 'Jewelry', icon: '💍' },
	{ id: 'Other', label: 'Other', icon: '📦' },
]

export default function Home() {
	const [items, setItems] = useState([])
	const [query, setQuery] = useState('')
	const [type, setType] = useState('')
	const [category, setCategory] = useState('')
	const [status, setStatus] = useState('open')
	const [error, setError] = useState('')
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const controller = new AbortController()
		const timeout = window.setTimeout(async () => {
			setIsLoading(true)
			setError('')
			try {
				const { data } = await api.get('/items', {
					params: {
						q: query || undefined,
						type: type || undefined,
						category: category || undefined,
						status: status || undefined,
					},
					signal: controller.signal,
				})
				setItems(data.items || [])
			} catch (requestError) {
				if (requestError.code !== 'ERR_CANCELED') {
					setError(requestError.response?.data?.message || 'Listings are currently unavailable. Please check back shortly.')
				}
			} finally {
				if (!controller.signal.aborted) setIsLoading(false)
			}
		}, 180)

		return () => {
			window.clearTimeout(timeout)
			controller.abort()
		}
	}, [query, type, category, status])

	const clearAllFilters = () => {
		setQuery('')
		setType('')
		setCategory('')
		setStatus('open')
	}

	const hasActiveFilters = Boolean(query || type || category || status !== 'open')

	return (
		<div className="page-shell">
			<Navbar />

			{/* Hero Section */}
			<section className="hero-section">
				<div className="hero-ambient-glow" aria-hidden="true" />
				<div className="hero-content">
					<div className="hero-badge">
						<span className="hero-badge-sparkle">✨</span>
						<span>Community Powered Reunions</span>
					</div>
					<h1 className="hero-title">
						Lost something? <br />
						<span className="hero-gradient-text">Or found a piece of someone's world?</span>
					</h1>
					<p className="hero-subtitle">
						Connect with neighbors, browse real-time listings, and help cherished belongings find their way back home.
					</p>

					<div className="hero-actions">
						<Link to="/report" className="hero-btn-primary">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
								<line x1="12" y1="5" x2="12" y2="19" />
								<line x1="5" y1="12" x2="19" y2="12" />
							</svg>
							<span>Post Lost or Found Item</span>
						</Link>
						<a href="#browse-section" className="hero-btn-secondary">
							<span>Browse Listings</span>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
								<line x1="12" y1="5" x2="12" y2="19" />
								<polyline points="19 12 12 19 5 12" />
							</svg>
						</a>
					</div>

					<div className="hero-metrics">
						<div className="metric-item">
							<span className="metric-dot dot-lost" />
							<span className="metric-label">Active Missing Cases</span>
						</div>
						<div className="metric-divider" />
						<div className="metric-item">
							<span className="metric-dot dot-found" />
							<span className="metric-label">Safely Recovered</span>
						</div>
						<div className="metric-divider" />
						<div className="metric-item">
							<span className="metric-dot dot-verified" />
							<span className="metric-label">Verified Community</span>
						</div>
					</div>
				</div>
			</section>

			{/* Main Search & Browse Area */}
			<section id="browse-section" className="browse-container">
				{/* Search & Main Filter Bar */}
				<div className="filter-card">
					<div className="search-bar-wrap">
						<span className="search-icon" aria-hidden="true">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<circle cx="11" cy="11" r="8" />
								<line x1="21" y1="21" x2="16.65" y2="16.65" />
							</svg>
						</span>
						<input
							type="search"
							className="search-input"
							placeholder="Search by title, location, or details (e.g. 'AirPods in Central Park')..."
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							aria-label="Search listings"
						/>
						{query && (
							<button type="button" className="search-clear-btn" onClick={() => setQuery('')} aria-label="Clear search query">
								✕
							</button>
						)}
					</div>

					<div className="filter-controls-row">
						{/* Type Segmented Control */}
						<div className="segmented-control" role="group" aria-label="Filter by type">
							{[
								{ val: '', label: 'All Items' },
								{ val: 'lost', label: 'Missing / Lost' },
								{ val: 'found', label: 'Found' },
							].map((tab) => (
								<button
									key={tab.val || 'all'}
									type="button"
									className={`seg-btn ${type === tab.val ? 'is-active' : ''}`}
									onClick={() => setType(tab.val)}
									aria-pressed={type === tab.val}
								>
									{tab.val === 'lost' && <span className="tab-indicator dot-lost" />}
									{tab.val === 'found' && <span className="tab-indicator dot-found" />}
									{tab.label}
								</button>
							))}
						</div>

						{/* Status Segmented Control */}
						<div className="segmented-control" role="group" aria-label="Filter by status">
							{[
								{ val: 'open', label: 'Active' },
								{ val: 'resolved', label: 'Resolved' },
								{ val: '', label: 'All' },
							].map((tab) => (
								<button
									key={tab.val || 'all-status'}
									type="button"
									className={`seg-btn ${status === tab.val ? 'is-active' : ''}`}
									onClick={() => setStatus(tab.val)}
									aria-pressed={status === tab.val}
								>
									{tab.label}
								</button>
							))}
						</div>
					</div>

					{/* Category Carousel / Pills */}
					<div className="category-scroll-container">
						<div className="category-pills" role="radiogroup" aria-label="Filter by category">
							{categories.map((cat) => (
								<button
									key={cat.id || 'all'}
									type="button"
									role="radio"
									aria-checked={category === cat.id}
									className={`category-pill ${category === cat.id ? 'is-selected' : ''}`}
									onClick={() => setCategory(cat.id)}
								>
									<span className="cat-pill-icon">{cat.icon}</span>
									<span className="cat-pill-label">{cat.label}</span>
								</button>
							))}
						</div>
					</div>
				</div>

				{/* Results Header */}
				<div className="results-header">
					<div className="results-title-group">
						<h2 className="results-heading">
							{type === 'lost' ? 'Lost Items' : type === 'found' ? 'Found Items' : 'Recent Listings'}
							{category && <span className="results-cat-tag"> in {category}</span>}
						</h2>
						<span className="results-count-badge">
							{isLoading ? 'Searching...' : `${items.length} ${items.length === 1 ? 'item' : 'items'} found`}
						</span>
					</div>

					{hasActiveFilters && (
						<button type="button" className="btn-clear-filters" onClick={clearAllFilters}>
							Reset Filters
						</button>
					)}
				</div>

				{/* Listings Grid or Empty / Loading States */}
				{error && (
					<div className="state-card state-error" role="alert">
						<div className="state-icon">⚠️</div>
						<h3>Unable to load listings</h3>
						<p>{error}</p>
						<button type="button" className="btn-outline" onClick={() => window.location.reload()}>
							Retry
						</button>
					</div>
				)}

				{isLoading && !error && (
					<div className="item-grid" aria-label="Loading listings">
						{[1, 2, 3, 4, 5, 6].map((n) => (
							<div key={n} className="card-skeleton">
								<div className="skeleton-image shimmer" />
								<div className="skeleton-content">
									<div className="skeleton-line shimmer line-sm" />
									<div className="skeleton-line shimmer line-lg" />
									<div className="skeleton-line shimmer line-md" />
									<div className="skeleton-line shimmer line-footer" />
								</div>
							</div>
						))}
					</div>
				)}

				{!isLoading && !error && items.length === 0 && (
					<div className="state-card state-empty">
						<div className="state-empty-art" aria-hidden="true">
							<div className="empty-radar">
								<div className="radar-circle radar-1" />
								<div className="radar-circle radar-2" />
								<div className="radar-circle radar-3" />
								<span className="radar-pin">📍</span>
							</div>
						</div>
						<h3>No matching items found</h3>
						<p>
							{hasActiveFilters
								? "We couldn't find any listings matching your current search or filters. Try adjusting your query or resetting filters."
								: 'No listings have been posted yet. Be the first to report a lost or found item!'}
						</p>
						<div className="state-empty-actions">
							{hasActiveFilters ? (
								<button type="button" className="btn-secondary" onClick={clearAllFilters}>
									Clear All Filters
								</button>
							) : null}
							<Link to="/report" className="btn-primary">
								+ Report an Item
							</Link>
						</div>
					</div>
				)}

				{!isLoading && !error && items.length > 0 && (
					<div className="item-grid">
						{items.map((item) => (
							<ItemCard key={item._id} item={item} />
						))}
					</div>
				)}
			</section>
		</div>
	)
}
