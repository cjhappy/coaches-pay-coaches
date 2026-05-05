import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/auth" replace />
  if (requiredRole && profile?.role !== requiredRole) return <Navigate to="/dashboard" replace />
  return children
}