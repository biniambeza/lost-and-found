import { createContext, useCallback, useEffect, useState } from 'react'

export const ThemeContext = createContext({
	theme: 'system',
	resolvedTheme: 'light',
	setTheme: () => {},
	toggleTheme: () => {},
})

function getSystemTheme() {
	if (typeof window === 'undefined') return 'light'
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
	const [theme, setThemeState] = useState(() => {
		try {
			return localStorage.getItem('lostfound-theme') || 'system'
		} catch {
			return 'system'
		}
	})

	const [systemPreference, setSystemPreference] = useState(getSystemTheme)

	useEffect(() => {
		const media = window.matchMedia('(prefers-color-scheme: dark)')
		const handler = (e) => setSystemPreference(e.matches ? 'dark' : 'light')
		media.addEventListener('change', handler)
		return () => media.removeEventListener('change', handler)
	}, [])

	const resolvedTheme = theme === 'system' ? systemPreference : theme

	useEffect(() => {
		const root = document.documentElement
		const meta = document.querySelector('meta[name="color-scheme"]')

		if (theme === 'system') {
			try {
				localStorage.removeItem('lostfound-theme')
			} catch {}
			if (meta) meta.content = 'light dark'
			root.classList.remove('light', 'dark')
			root.classList.add(resolvedTheme)
		} else {
			try {
				localStorage.setItem('lostfound-theme', theme)
			} catch {}
			if (meta) meta.content = theme
			root.classList.remove('light', 'dark')
			root.classList.add(theme)
		}
	}, [theme, resolvedTheme])

	const setTheme = useCallback((newTheme) => {
		setThemeState(newTheme)
	}, [])

	const toggleTheme = useCallback(() => {
		setThemeState((current) => {
			const currentResolved = current === 'system' ? getSystemTheme() : current
			return currentResolved === 'dark' ? 'light' : 'dark'
		})
	}, [])

	return (
		<ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	)
}
