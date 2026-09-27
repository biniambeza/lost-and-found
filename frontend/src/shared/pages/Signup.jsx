import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import useAuth from '../../context/useAuth'

export default function Signup() {
	const { signup, user } = useAuth()
	const navigate = useNavigate()
	const [form, setForm] = useState({ name: '', email: '', password: '' })
	const [error, setError] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	if (user) return <Navigate to="/" replace />

	function updateField(event) {
		setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
	}

	async function handleSubmit(event) {
		event.preventDefault()
		setError('')
		setIsSubmitting(true)
		try {
			await signup(form)
			navigate('/', { replace: true })
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'We could not create your account. Check your connection and try again.')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<main className="auth-screen">
			<section className="auth-aside" aria-label="Lost and Found">
				<Link className="wordmark" to="/signup"><span className="wordmark-mark">L</span> found / still waiting</Link>
				<div className="aside-copy">
					<p className="eyebrow">A place for things to find their way back</p>
					<h1>Good things come around.</h1>
					<p className="aside-note">Join the neighbors helping a lost moment find its way home.</p>
				</div>
				<p className="aside-index">01 <span /> COMMUNITY BOARD</p>
			</section>

			<section className="auth-content">
				<div className="auth-form-wrap">
					<p className="form-kicker">MAKE YOURSELF AT HOME</p>
					<h2>Create an account</h2>
					<p className="form-intro">A few details, then you’re in.</p>
					<form className="auth-form" onSubmit={handleSubmit}>
						<label htmlFor="name">Your name</label>
						<input id="name" name="name" type="text" autoComplete="name" minLength={2} maxLength={80} required value={form.name} onChange={updateField} />
						<label htmlFor="email">Email address</label>
						<input id="email" name="email" type="email" autoComplete="email" maxLength={254} required value={form.email} onChange={updateField} />
						<label htmlFor="password">Password</label>
						<input id="password" name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={form.password} onChange={updateField} />
						{error && <p className="form-error" role="alert">{error}</p>}
						<button className="submit-button" type="submit" disabled={isSubmitting}>
							{isSubmitting ? 'Creating account...' : 'Create account'} <span aria-hidden="true">→</span>
						</button>
					</form>
					<p className="switch-auth">Already have an account? <Link to="/login">Sign in</Link></p>
				</div>
				<p className="content-foot">LOST &amp; FOUND <span>•</span> A LITTLE CLOSER TO HOME</p>
			</section>
		</main>
	)
}
