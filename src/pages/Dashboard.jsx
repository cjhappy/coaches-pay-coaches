import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import NavMessagesLink from '../components/NavMessagesLink'
<li><a onClick={() => navigate('/messages')}>Messages</a></li>
export default function Dashboard() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/auth')
  }

  const isSeller = profile?.role === 'seller' || profile?.role === 'both'
  const isBuyer = profile?.role === 'buyer' || profile?.role === 'both'

  return (
    <div className="page-body">
      <nav className="cpc-nav">
        <a className="cpc-logo" onClick={() => navigate('/')}>
          <div className="logo-badge">CPC</div>
          <div className="logo-text">COACHES <em>PAY</em> COACHES</div>
        </a>
       <ul className="nav-links">
  <li><a onClick={() => navigate('/marketplace')}>Browse</a></li>
  <li><a onClick={() => navigate('/coaches')}>Coaches</a></li>
  {(profile?.role === 'buyer' || profile?.role === 'both') && <li><a onClick={() => navigate('/purchases')}>My Library</a></li>}
  {(profile?.role === 'seller' || profile?.role === 'both') && <li><a onClick={() => navigate('/seller')}>My Store</a></li>}
  {profile?.is_admin && <li><a onClick={() => navigate('/admin')}>Admin</a></li>}
  <NavMessagesLink />
  <MobileNav />
  <li><a className="nav-cta" onClick={handleSignOut}>Sign Out</a></li>
</ul>
      </nav>

      <div className="dash-header">
        <div className="section-label">Dashboard</div>
        <h1>Welcome, <em>{profile?.full_name?.split(' ')[0] || 'Coach'}</em></h1>
        <p style={{ color: 'var(--muted)' }}>
          {profile?.role === 'both' ? 'You can buy and sell on Coaches Pay Coaches.' : `You're logged in as a `}
          {profile?.role !== 'both' && <strong style={{ color: 'var(--green)' }}>{profile?.role}</strong>}
        </p>
      </div>

      <div className="dash-body">
        <div className="section-label">Quick Actions</div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <button className="btn btn-green" onClick={() => navigate('/marketplace')}>Browse Marketplace →</button>
          {isBuyer && <button className="btn btn-ghost" onClick={() => navigate('/purchases')}>My Library</button>}
          {isSeller && <button className="btn btn-ghost" onClick={() => navigate('/seller')}>My Store</button>}
        </div>
      </div>
    </div>
  )
}