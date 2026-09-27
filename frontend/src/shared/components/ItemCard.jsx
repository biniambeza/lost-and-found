import { Link } from 'react-router-dom'

export default function ItemCard({ item }) {
	return (
		<article className="item-card">
			<Link className="item-card-link" to={`/items/${item._id}`}>
				<div className="item-card-image">
					{item.photoUrl ? <img src={item.photoUrl} alt={item.title} loading="lazy" /> : <span aria-hidden="true">{item.type === 'lost' ? 'L' : 'F'}</span>}
				</div>
				<div className="item-card-copy">
					<div className="item-card-meta">
						<span className={`item-type item-type-${item.type}`}>{item.type}</span>
						<span>{item.status}</span>
					</div>
					<h2>{item.title}</h2>
					<p className="item-card-location">{item.location} <span>·</span> {item.category}</p>
					<p className="item-card-description">{item.description}</p>
					<p className="item-card-byline">Posted by {item.postedBy?.name || 'Community member'}</p>
				</div>
			</Link>
		</article>
	)
}
