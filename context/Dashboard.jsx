import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/auth')
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Welcome, {profile?.full_name || user?.email}</h1>
      <p>Role: <strong>{profile?.role}</strong></p>

      {profile?.role === 'seller' && (
        <button onClick={() => navigate('/seller')}>Go to Seller Dashboard</button>
      )}

      <br /><br />
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  )
}
