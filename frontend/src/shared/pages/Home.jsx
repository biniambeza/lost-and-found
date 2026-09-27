import { useEffect, useState } from 'react'
import ItemCard from '../components/ItemCard.jsx'
import Navbar from '../components/Navbar.jsx'
import api from '../../services/api'

export default function Home() {
	const [items, setItems] = useState([])
	const [query, setQuery] = useState('')
	const [type, setType] = useState('')
	const [error, setError] = useState('')
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const controller = new AbortController()
		const timeout = window.setTimeout(async () => {
			setIsLoading(true)
			setError('')
			try {
				const { data } = await api.get('/items', {
					params: { q: query || undefined, type: type || undefined, status: 'open' },
					signal: controller.signal,
				})
				setItems(data.items)
			} catch (requestError) {
				if (requestError.code !== 'ERR_CANCELED') {
					setError(requestError.response?.data?.message || 'Listings are unavailable right now.')
				}
			} finally {
				if (!controller.signal.aborted) setIsLoading(false)
			}
		}, 180)

		return () => {
			window.clearTimeout(timeout)
			controller.abort()
		}
	}, [query, type])

	return (
		<main className="browse-page">
			<Navbar />
			<section className="browse-heading">
				<p className="browse-kicker">THE COMMUNITY BOARD</p>
				<h1>What are we looking for?</h1>
				<p>Lost something, found something, or just passing the word along.</p>
			</section>
			<section className="listing-tools" aria-label="Search listings">
				<label className="search-field">
					<span className="sr-only">Search listings</span>
					<span aria-hidden="true">⌕</span>
					<input type="search" placeholder="Try a name, place, or detail" value={query} onChange={(event) => setQuery(event.target.value)} />
				</label>
				<div className="type-filter" aria-label="Filter by listing type">
					{[['', 'All listings'], ['lost', 'Lost'], ['found', 'Found']].map(([value, label]) => (
						<button key={value || 'all'} type="button" className={type === value ? 'selected' : ''} aria-pressed={type === value} onClick={() => setType(value)}>{label}</button>
					))}
				</div>
			</section>
			<section className="listing-section" aria-live="polite">
				<div className="listing-section-heading">
					<h2>{type ? `${type} items` : 'Recent listings'}</h2>
					<span>{isLoading ? 'Loading' : `${items.length} ${items.length === 1 ? 'listing' : 'listings'}`}</span>
				</div>
				{error ? <p className="listing-message listing-error" role="alert">{error}</p> : null}
				{!error && !isLoading && items.length === 0 ? <p className="listing-message">No open listings match that search.</p> : null}
				<div className="item-grid">
					{items.map((item) => <ItemCard key={item._id} item={item} />)}
				</div>
			</section>
		</main>
	)
}
