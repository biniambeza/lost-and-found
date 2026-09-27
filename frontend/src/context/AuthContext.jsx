import { useEffect, useState } from 'react'
import AuthContext from './authContextValue'
import api, { storageKey } from '../services/api'

function readSession() {
	try {
		const session = JSON.parse(localStorage.getItem(storageKey) || 'null')
		return session?.token && session?.user ? session : null
	} catch {
		return null
	}
}

export function AuthProvider({ children }) {
	const [session, setSession] = useState(readSession)

	useEffect(() => {
		function syncSession(event) {
			if (event.key === storageKey) setSession(readSession())
		}
		function clearSession() {
			setSession(null)
		}
		window.addEventListener('storage', syncSession)
		window.addEventListener('lost-found-session-cleared', clearSession)
		return () => {
			window.removeEventListener('storage', syncSession)
			window.removeEventListener('lost-found-session-cleared', clearSession)
		}
	}, [])

	useEffect(() => {
		if (!session?.token) return undefined
		const controller = new AbortController()
		api.get('/auth/me', { signal: controller.signal })
			.then(({ data }) => {
				const nextSession = { token: session.token, user: data.user }
				localStorage.setItem(storageKey, JSON.stringify(nextSession))
				setSession(nextSession)
			})
			.catch((error) => {
				if (error.code !== 'ERR_CANCELED' && error.response?.status === 401) {
					localStorage.removeItem(storageKey)
					setSession(null)
				}
			})
		return () => controller.abort()
	}, [session?.token])

	async function login(credentials) {
		const { data } = await api.post('/auth/login', credentials)
		const nextSession = { token: data.token, user: data.user }
		localStorage.setItem(storageKey, JSON.stringify(nextSession))
		setSession(nextSession)
		return data.user
	}

	async function signup(details) {
		const { data } = await api.post('/auth/signup', details)
		const nextSession = { token: data.token, user: data.user }
		localStorage.setItem(storageKey, JSON.stringify(nextSession))
		setSession(nextSession)
		return data.user
	}

	function logout() {
		localStorage.removeItem(storageKey)
		setSession(null)
	}

	return (
		<AuthContext.Provider value={{ user: session?.user ?? null, token: session?.token ?? null, login, signup, logout }}>
			{children}
		</AuthContext.Provider>
	)
}
