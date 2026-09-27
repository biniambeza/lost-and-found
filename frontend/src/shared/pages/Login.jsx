import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../../context/useAuth'

export default function Login() {
	const { login, user } = useAuth()
	const navigate = useNavigate()
	const location = useLocation()
	const [form, setForm] = useState({ email: '', password: '' })
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
			await login(form)
			navigate(location.state?.from || '/', { replace: true })
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'We could not sign you in. Check your connection and try again.')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<main className="auth-screen">
			<section className="auth-aside" aria-label="Lost and Found">
				<Link className="wordmark" to="/login"><span className="wordmark-mark">L</span> found / still waiting</Link>
				<div className="aside-copy">
					<p className="eyebrow">A place for things to find their way back</p>
					<h1>Somewhere, someone is looking.</h1>
					<p className="aside-note">A familiar face, a well-loved thing, a small piece of your day.</p>
				</div>
				<p className="aside-index">01 <span /> COMMUNITY BOARD</p>
			</section>

			<section className="auth-content">
				<div className="auth-form-wrap">
					<p className="form-kicker">WELCOME BACK</p>
					<h2>Sign in</h2>
					<p className="form-intro">Pick up where you left off.</p>
					<form className="auth-form" onSubmit={handleSubmit}>
						<label htmlFor="email">Email address</label>
						<input id="email" name="email" type="email" autoComplete="email" maxLength={254} required value={form.email} onChange={updateField} />
						<div className="label-row"><label htmlFor="password">Password</label></div>
						<input id="password" name="password" type="password" autoComplete="current-password" minLength={8} maxLength={128} required value={form.password} onChange={updateField} />
						{error && <p className="form-error" role="alert">{error}</p>}
						<button className="submit-button" type="submit" disabled={isSubmitting}>
							{isSubmitting ? 'Signing in...' : 'Sign in'} <span aria-hidden="true">→</span>
						</button>
					</form>
					<p className="switch-auth">New here? <Link to="/signup">Create an account</Link></p>
				</div>
				<p className="content-foot">LOST &amp; FOUND <span>•</span> A LITTLE CLOSER TO HOME</p>
			</section>
		</main>
	)
}
