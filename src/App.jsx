import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AuthForm from './components/AuthForm'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import MobileNav from './components/MobileNav'
import SiteFooter from './components/SiteFooter'
import Analytics from './components/Analytics'

// Everything below Home/AuthForm is lazy-loaded — those two are the pages
// most people hit first (landing page, sign up/log in), so they stay in
// the main bundle for instant first paint. Splitting the rest cut the
// single ~580KB production chunk down significantly, which matters most
// on mobile where a chunk this size was flagged by the Vite build itself.
const Dashboard = lazy(() => import('./pages/Dashboard'))
const SellerDashboard = lazy(() => import('./pages/SellerDashboard'))
const Marketplace = lazy(() => import('./pages/Marketplace'))
const ListingDetail = lazy(() => import('./pages/ListingDetail'))
const Purchases = lazy(() => import('./pages/Purchases'))
const CheckoutSuccess = lazy(() => import('./pages/CheckoutSuccess'))
const CoachProfile = lazy(() => import('./pages/CoachProfile'))
const Coaches = lazy(() => import('./pages/Coaches'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Admin = lazy(() => import('./pages/Admin'))
const Terms = lazy(() => import('./pages/Terms'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Messages = lazy(() => import('./pages/Messages'))
const Feed = lazy(() => import('./pages/Feed'))
const RefundPolicy = lazy(() => import('./pages/Refunds'))
const AccountSettings = lazy(() => import('./pages/AccountSettings'))
const Saved = lazy(() => import('./pages/Saved'))

function RouteLoading() {
  return <div className="page-body cream-page" style={{ padding: '4rem 5%' }}><span className="muted">Loading...</span></div>
}

function AppFooter() {
  const location = useLocation()
  if (location.pathname === '/') return null
  return <SiteFooter />
}

function App() {
  const { user, loading } = useAuth()
  if (loading) return <div>Loading...</div>

  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <AuthForm onSuccess={() => window.location.href = '/dashboard'} />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refunds" element={<RefundPolicy />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/checkout-success" element={<CheckoutSuccess />} />
          <Route path="/coach/:id" element={<CoachProfile />} />
          <Route path="/coaches" element={<Coaches />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/seller" element={<ProtectedRoute requiredRole="seller"><SellerDashboard /></ProtectedRoute>} />
          <Route path="/purchases" element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
          <Route path="/saved" element={<ProtectedRoute><Saved /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <AppFooter />
      <MobileNav />
      <Analytics />
    </BrowserRouter>
  )
}

export default App