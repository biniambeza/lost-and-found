import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../shared/components/Button.jsx'
import Navbar from '../../shared/components/Navbar.jsx'
import api from '../../services/api'

const categories = [
	{ value: 'Electronics', label: 'Electronics (Phones, Laptops, Earbuds)', icon: '💻' },
	{ value: 'Keys', label: 'Keys (House, Car, Keychains)', icon: '🔑' },
	{ value: 'Bags & Wallets', label: 'Bags & Wallets (Backpacks, Purses)', icon: '🎒' },
	{ value: 'IDs & Documents', label: 'IDs & Documents (Passports, Cards)', icon: '📄' },
	{ value: 'Pets', label: 'Pets (Dogs, Cats, Birds)', icon: '🐾' },
	{ value: 'Jewelry', label: 'Jewelry & Watches', icon: '💍' },
	{ value: 'Clothing', label: 'Clothing & Accessories', icon: '👕' },
	{ value: 'Other', label: 'Other Items', icon: '📦' },
]

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
	const [previewUrl, setPreviewUrl] = useState('')
	const [error, setError] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isDragging, setIsDragging] = useState(false)

	function updateField(event) {
		setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
	}

	function handlePhotoSelect(file) {
		if (!file) return
		if (!file.type.startsWith('image/')) {
			setError('Please select a valid image file (JPEG, PNG, WebP).')
			return
		}
		setPhoto(file)
		const url = URL.createObjectURL(file)
		setPreviewUrl(url)
		setError('')
	}

	function removePhoto() {
		setPhoto(null)
		if (previewUrl) URL.revokeObjectURL(previewUrl)
		setPreviewUrl('')
	}

	async function handleSubmit(event) {
		event.preventDefault()
		setError('')
		if (form.title.trim().length < 3) return setError('Please give the listing a title of at least 3 characters.')
		if (form.description.trim().length < 10) return setError('Please describe the item with at least 10 characters.')
		if (!form.location.trim()) return setError('Please add a location so others know where to look.')

		setIsSubmitting(true)
		try {
			const payload = new FormData()
			Object.entries(form).forEach(([key, value]) => payload.append(key, value))
			if (photo) payload.append('photo', photo)
			const { data } = await api.post('/items', payload)
			navigate(`/items/${data.item._id}`, { replace: true })
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'The listing could not be saved. Please verify your connection and try again.')
		} finally {
			setIsSubmitting(false)
		}
	}

	const isLost = form.type === 'lost'

	return (
		<div className="page-shell">
			<Navbar />

			<div className="form-page-container">
				<div className="form-header-area">
					<Link to="/" className="breadcrumb-back mb-3">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
							<line x1="19" y1="12" x2="5" y2="12" />
							<polyline points="12 19 5 12 12 5" />
						</svg>
						<span>Back to browse</span>
					</Link>
					<span className="form-eyebrow">COMMUNITY NOTICE</span>
					<h1 className="form-main-title">Report a Lost or Found Item</h1>
					<p className="form-subtitle">
						The more detail and clarity you provide, the faster items are successfully reunited with their owners.
					</p>
				</div>

				<form className="report-card-form" onSubmit={handleSubmit}>
					{/* Type Chooser Cards */}
					<div className="type-choice-grid" role="radiogroup" aria-label="Listing Type">
						<button
							type="button"
							className={`type-choice-card type-lost ${isLost ? 'is-selected' : ''}`}
							onClick={() => setForm((c) => ({ ...c, type: 'lost' }))}
							role="radio"
							aria-checked={isLost}
						>
							<div className="type-choice-icon">🔍</div>
							<div className="type-choice-text">
								<strong>I Lost Something</strong>
								<span>Report a missing personal item to enlist the community</span>
							</div>
							<div className="type-choice-radio">
								{isLost && <span className="radio-inner" />}
							</div>
						</button>

						<button
							type="button"
							className={`type-choice-card type-found ${!isLost ? 'is-selected' : ''}`}
							onClick={() => setForm((c) => ({ ...c, type: 'found' }))}
							role="radio"
							aria-checked={!isLost}
						>
							<div className="type-choice-icon">🎁</div>
							<div className="type-choice-text">
								<strong>I Found Something</strong>
								<span>Post an item you discovered so its rightful owner can claim it</span>
							</div>
							<div className="type-choice-radio">
								{!isLost && <span className="radio-inner" />}
							</div>
						</button>
					</div>

					{/* Title Input */}
					<div className="form-field-group">
						<label htmlFor="title" className="form-label">
							<span>Item Title</span>
							<span className="field-hint">e.g. "Silver Hydro Flask with Stickers" or "Keys on Blue Lanyard"</span>
						</label>
						<input
							id="title"
							name="title"
							type="text"
							className="form-input"
							minLength={3}
							maxLength={120}
							required
							value={form.title}
							onChange={updateField}
							placeholder="Short, recognizable summary of the item"
						/>
						<span className="char-count">{form.title.length} / 120</span>
					</div>

					{/* Category and Date Grid */}
					<div className="form-two-col">
						<div className="form-field-group">
							<label htmlFor="category" className="form-label">Category</label>
							<select
								id="category"
								name="category"
								className="form-select"
								value={form.category}
								onChange={updateField}
							>
								{categories.map((cat) => (
									<option key={cat.value} value={cat.value}>
										{cat.icon} {cat.label}
									</option>
								))}
							</select>
						</div>

						<div className="form-field-group">
							<label htmlFor="date" className="form-label">
								{isLost ? 'Date Last Seen' : 'Date Discovered'}
							</label>
							<input
								id="date"
								name="date"
								type="date"
								className="form-input"
								required
								value={form.date}
								onChange={updateField}
							/>
						</div>
					</div>

					{/* Location Input */}
					<div className="form-field-group">
						<label htmlFor="location" className="form-label">
							<span>Location</span>
							<span className="field-hint">Specific spot, landmark, building, transit line, or intersection</span>
						</label>
						<div className="input-with-icon">
							<span className="input-icon">📍</span>
							<input
								id="location"
								name="location"
								type="text"
								className="form-input with-left-icon"
								maxLength={160}
								required
								value={form.location}
								onChange={updateField}
								placeholder="e.g. Main Library 3rd Floor, or Central Park near the Lake"
							/>
						</div>
					</div>

					{/* Description Input */}
					<div className="form-field-group">
						<label htmlFor="description" className="form-label">
							<span>Detailed Description</span>
							<span className="field-hint">Include brand, color, scratches, case, or unique markings</span>
						</label>
						<textarea
							id="description"
							name="description"
							className="form-textarea"
							minLength={10}
							maxLength={3000}
							required
							rows={5}
							value={form.description}
							onChange={updateField}
							placeholder="Provide as much context as possible. If this is a lost item, mention distinct identifiers that only the true owner would know."
						/>
						<span className="char-count">{form.description.length} / 3000</span>
					</div>

					{/* Photo Upload Zone */}
					<div className="form-field-group">
						<span className="form-label">
							<span>Photo of Item</span>
							<span className="field-hint">Optional, but increases recovery chance by 85%</span>
						</span>

						{previewUrl ? (
							<div className="photo-preview-box">
								<img src={previewUrl} alt="Preview of item" className="photo-preview-image" />
								<div className="photo-preview-meta">
									<span className="photo-filename">{photo?.name || 'Uploaded photo'}</span>
									<span className="photo-filesize">
										{photo ? `${(photo.size / (1024 * 1024)).toFixed(2)} MB` : ''}
									</span>
									<button type="button" className="btn-remove-photo" onClick={removePhoto}>
										Remove Photo
									</button>
								</div>
							</div>
						) : (
							<label
								htmlFor="photo"
								className={`photo-dropzone ${isDragging ? 'is-dragging' : ''}`}
								onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
								onDragLeave={() => setIsDragging(false)}
								onDrop={(e) => {
									e.preventDefault()
									setIsDragging(false)
									handlePhotoSelect(e.dataTransfer.files?.[0])
								}}
							>
								<div className="dropzone-icon">
									<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
										<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
										<circle cx="8.5" cy="8.5" r="1.5" />
										<polyline points="21 15 16 10 5 21" />
									</svg>
								</div>
								<div className="dropzone-text">
									<strong>Click to upload an image</strong> or drag and drop
									<span>Supports PNG, JPG, or WebP up to 5MB</span>
								</div>
								<input
									id="photo"
									name="photo"
									type="file"
									className="sr-only"
									accept="image/jpeg,image/png,image/webp"
									onChange={(e) => handlePhotoSelect(e.target.files?.[0])}
								/>
							</label>
						)}
					</div>

					{error && (
						<div className="form-alert-error" role="alert">
							<span>⚠️</span>
							<span>{error}</span>
						</div>
					)}

					<div className="form-submit-row">
						<Button
							type="submit"
							variant="primary"
							className="form-primary-btn"
							isLoading={isSubmitting}
						>
							<span>{isSubmitting ? 'Publishing Report...' : isLost ? 'Publish Lost Item Report' : 'Publish Found Item Report'}</span>
							{!isSubmitting && <span aria-hidden="true">→</span>}
						</Button>
					</div>
				</form>
			</div>
		</div>
	)
}
