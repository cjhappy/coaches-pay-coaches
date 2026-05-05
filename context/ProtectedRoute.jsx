import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Usage: <ProtectedRoute requiredRole="seller"> ... </ProtectedRoute>
export default function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <div className="loading">Loading…</div>

  if (!user) return <Navigate to="/auth" replace />

  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
