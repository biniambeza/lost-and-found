import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../shared/components/Button.jsx'
import Navbar from '../../shared/components/Navbar.jsx'
import api from '../../services/api'

const categories = ['Electronics', 'IDs & Documents', 'Keys', 'Bags & Wallets', 'Clothing', 'Pets', 'Jewelry', 'Other']

const emptyForm = {
	type: 'lost',
	title: '',
	description: '',
	category: 'Electronics',
	location: '',
	date: new Date().toISOString().slice(0, 10),
}

export default function ReportItem() {
	const navigate = useNavigate()
	const [form, setForm] = useState(emptyForm)
	const [photo, setPhoto] = useState(null)
	const [error, setError] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	function updateField(event) {
		setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
	}

	async function handleSubmit(event) {
		event.preventDefault()
		setError('')
		if (form.title.trim().length < 3) return setError('Give the listing a title of at least 3 characters.')
		if (form.description.trim().length < 10) return setError('Describe the item in at least 10 characters.')
		if (!form.location.trim()) return setError('Add a location so others know where to look.')

		setIsSubmitting(true)
		try {
			const payload = new FormData()
			Object.entries(form).forEach(([key, value]) => payload.append(key, value))
			if (photo) payload.append('photo', photo)
			const { data } = await api.post('/items', payload)
			navigate(`/items/${data.item._id}`, { replace: true })
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'The listing could not be saved. Try again.')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<main className="browse-page">
			<Navbar />
			<section className="browse-heading">
				<p className="browse-kicker">SHARE A LISTING</p>
				<h1>Report a lost or found item</h1>
				<p>A clear photo and a few specific details give it the best chance of finding its way home.</p>
			</section>
			<form className="report-form" onSubmit={handleSubmit}>
				<fieldset className="type-filter report-type">
					<legend className="sr-only">Listing type</legend>
					{[['lost', 'I lost this'], ['found', 'I found this']].map(([value, label]) => (
						<button key={value} type="button" className={form.type === value ? 'selected' : ''} aria-pressed={form.type === value} onClick={() => setForm((current) => ({ ...current, type: value }))}>
							{label}
						</button>
					))}
				</fieldset>
				<label htmlFor="title">Title</label>
				<input id="title" name="title" minLength={3} maxLength={120} required value={form.title} onChange={updateField} placeholder="Blue canvas backpack" />
				<label htmlFor="description">Description</label>
				<textarea id="description" name="description" minLength={10} maxLength={3000} required rows={6} value={form.description} onChange={updateField} placeholder="Any marks, contents, or details that would help someone recognize it." />
				<div className="form-grid">
					<div>
						<label htmlFor="category">Category</label>
						<select id="category" name="category" value={form.category} onChange={updateField}>
							{categories.map((category) => <option key={category} value={category}>{category}</option>)}
						</select>
					</div>
					<div>
						<label htmlFor="date">{form.type === 'lost' ? 'Last seen' : 'Found on'}</label>
						<input id="date" name="date" type="date" required value={form.date} onChange={updateField} />
					</div>
				</div>
				<label htmlFor="location">Location</label>
				<input id="location" name="location" maxLength={160} required value={form.location} onChange={updateField} placeholder="Library second floor, or the 4 train" />
				<label htmlFor="photo">Photo (optional)</label>
				<input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setPhoto(event.target.files?.[0] || null)} />
				{error ? <p className="form-error" role="alert">{error}</p> : null}
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? 'Publishing...' : 'Publish listing'} <span aria-hidden="true">→</span>
				</Button>
			</form>
		</main>
	)
}
