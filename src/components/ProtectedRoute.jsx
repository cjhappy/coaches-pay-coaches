import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from './LoadingScreen'

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/auth" replace />

  if (requiredRole === 'seller') {
    if (profile?.role !== 'seller' && profile?.role !== 'both') {
      return <Navigate to="/dashboard" replace />
    }
  }

  return children
}