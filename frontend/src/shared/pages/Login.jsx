import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../../context/useAuth'
import ThemeToggle from '../components/ThemeToggle.jsx'

export default function Login() {
	const { login, user } = useAuth()
	const navigate = useNavigate()
	const location = useLocation()
	const [form, setForm] = useState({ email: '', password: '' })
	const [error, setError] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [showPassword, setShowPassword] = useState(false)

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
			setError(requestError.response?.data?.message || 'We could not sign you in. Please check your credentials and try again.')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<main className="auth-canvas">
			<div className="auth-ambient-orb orb-1" aria-hidden="true" />
			<div className="auth-ambient-orb orb-2" aria-hidden="true" />

			<header className="auth-top-nav">
				<Link className="site-brand" to="/">
					<div className="site-brand-logo">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
							<circle cx="11" cy="11" r="7" />
							<line x1="21" y1="21" x2="16.65" y2="16.65" />
							<path d="M11 8v6M8 11h6" strokeWidth="1.8" />
						</svg>
					</div>
					<div className="site-brand-text">
						<span className="site-brand-name">FindIt</span>
					</div>
				</Link>
				<ThemeToggle />
			</header>

			<div className="auth-card-wrapper">
				<div className="auth-glass-card">
					<div className="auth-header-block">
						<span className="auth-kicker">WELCOME BACK</span>
						<h1 className="auth-title">Sign In</h1>
						<p className="auth-subtitle">Pick up where you left off in your community.</p>
					</div>

					<form className="auth-form-styled" onSubmit={handleSubmit}>
						<div className="form-field-group">
							<label htmlFor="email" className="form-label">Email Address</label>
							<div className="input-with-icon">
								<span className="input-icon">✉️</span>
								<input
									id="email"
									name="email"
									type="email"
									className="form-input with-left-icon"
									autoComplete="email"
									maxLength={254}
									required
									value={form.email}
									onChange={updateField}
									placeholder="your.email@example.com"
								/>
							</div>
						</div>

						<div className="form-field-group">
							<div className="label-with-hint">
								<label htmlFor="password" className="form-label">Password</label>
							</div>
							<div className="input-with-icon">
								<span className="input-icon">🔒</span>
								<input
									id="password"
									name="password"
									type={showPassword ? 'text' : 'password'}
									className="form-input with-left-icon with-right-btn"
									autoComplete="current-password"
									minLength={8}
									maxLength={128}
									required
									value={form.password}
									onChange={updateField}
									placeholder="••••••••"
								/>
								<button
									type="button"
									className="input-eye-btn"
									onClick={() => setShowPassword(!showPassword)}
									aria-label={showPassword ? 'Hide password' : 'Show password'}
								>
									{showPassword ? '🙈' : '👁️'}
								</button>
							</div>
						</div>

						{error && (
							<div className="form-alert-error" role="alert">
								<span>⚠️</span>
								<span>{error}</span>
							</div>
						)}

						<button className="auth-submit-btn" type="submit" disabled={isSubmitting}>
							<span>{isSubmitting ? 'Signing in...' : 'Sign In to Account'}</span>
							{!isSubmitting && <span aria-hidden="true">→</span>}
						</button>
					</form>

					<div className="auth-card-footer">
						<p className="switch-auth-text">
							Don't have an account yet? <Link to="/signup" className="auth-accent-link">Create an account</Link>
						</p>
					</div>
				</div>

				<p className="auth-legal-foot">FindIt Community Network · Helping things find their way back home</p>
			</div>
		</main>
	)
}
