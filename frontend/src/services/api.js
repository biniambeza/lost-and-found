import axios from 'axios'

export const storageKey = 'lost-found-session'

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
	timeout: 15000,
})

api.interceptors.request.use((config) => {
	try {
		const session = JSON.parse(localStorage.getItem(storageKey) || 'null')
		if (session?.token) config.headers.Authorization = `Bearer ${session.token}`
	} catch {
		localStorage.removeItem(storageKey)
	}
	return config
})

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401 && !String(error.config?.url || '').includes('/auth/login') && !String(error.config?.url || '').includes('/auth/signup')) {
			localStorage.removeItem(storageKey)
			window.dispatchEvent(new Event('lost-found-session-cleared'))
		}
		return Promise.reject(error)
	},
)

export default api
