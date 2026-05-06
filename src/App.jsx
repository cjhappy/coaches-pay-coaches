import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AuthForm from './components/AuthForm'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import SellerDashboard from './pages/SellerDashboard'
import Marketplace from './pages/Marketplace'
import ListingDetail from './pages/ListingDetail'
import Purchases from './pages/Purchases'
import CoachProfile from './pages/CoachProfile'
import Coaches from './pages/Coaches'
import ResetPassword from './pages/ResetPassword'
import Admin from './pages/Admin'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Messages from './pages/Messages'

function App() {
  const { user, loading } = useAuth()
  if (loading) return <div>Loading...</div>

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <AuthForm onSuccess={() => window.location.href = '/dashboard'} />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/coach/:id" element={<CoachProfile />} />
        <Route path="/coaches" element={<Coaches />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/seller" element={<ProtectedRoute requiredRole="seller"><SellerDashboard /></ProtectedRoute>} />
        <Route path="/purchases" element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App