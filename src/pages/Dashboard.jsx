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
    <div className="page-body">
      <nav className="cpc-nav">
        <a className="cpc-logo">
          <div className="logo-badge">CPC</div>
          <div className="logo-text">COACHES <em>PAY</em> COACHES</div>
        </a>
        <ul className="nav-links">
          <li><a onClick={() => navigate('/marketplace')}>Browse</a></li>
          {profile?.role === 'buyer' && <li><a onClick={() => navigate('/purchases')}>My Library</a></li>}
          {profile?.role === 'seller' && <li><a onClick={() => navigate('/seller')}>My Store</a></li>}
          <li><a className="nav-cta" onClick={handleSignOut}>Sign Out</a></li>
        </ul>
      </nav>

      <div className="dash-header">
        <div className="section-label">Dashboard</div>
        <h1>Welcome, <em>{profile?.full_name?.split(' ')[0] || 'Coach'}</em></h1>
        <p style={{ color: 'var(--muted)' }}>You're logged in as a <strong style={{ color: 'var(--green)' }}>{profile?.role}</strong>.</p>
      </div>

      <div className="dash-body">
        {profile?.role === 'seller' ? (
          <>
            <div className="section-label">Quick Actions</div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              <button className="btn btn-green" onClick={() => navigate('/seller')}>Go to My Store →</button>
              <button className="btn btn-ghost" onClick={() => navigate('/marketplace')}>Browse Marketplace</button>
            </div>
          </>
        ) : (
          <>
            <div className="section-label">Quick Actions</div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              <button className="btn btn-green" onClick={() => navigate('/marketplace')}>Browse Marketplace →</button>
              <button className="btn btn-ghost" onClick={() => navigate('/purchases')}>My Library</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}