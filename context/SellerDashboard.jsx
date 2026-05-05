import { useAuth } from '../context/AuthContext'

export default function SellerDashboard() {
  const { profile } = useAuth()
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Seller Dashboard</h1>
      <p>Hello {profile?.full_name} — list and manage your coaching materials here.</p>
    </div>
  )
}
