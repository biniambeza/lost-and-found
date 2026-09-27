import { Navigate } from 'react-router-dom'
import useAuth from '../../context/useAuth'

export default function RequireAdmin({ children }) {
	const { user } = useAuth()
	if (!user) return <Navigate to="/login" replace />
	if (user.role !== 'admin') return <Navigate to="/" replace />
	return children
}
