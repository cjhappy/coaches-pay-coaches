import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AuthForm from './components/AuthForm'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import SellerDashboard from './pages/SellerDashboard'

function App() {
  const { user, loading } = useAuth()

  if (loading) return <div className="loading">Loading…</div>

  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth page — redirect to dashboard if already logged in */}
        <Route
          path="/auth"
          element={user ? <Navigate to="/dashboard" replace /> : <AuthForm onSuccess={() => window.location.href = '/dashboard'} />}
        />

        {/* Protected: any logged-in user */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected: sellers only */}
        <Route
          path="/seller"
          element={
            <ProtectedRoute requiredRole="seller">
              <SellerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/auth'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
