import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NavMessagesLink from './NavMessagesLink'

export default function SiteNav({ active }) {
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()

  async function handleSignOut() {
    await signOut()
    navigate('/auth')
  }

  return (
    <nav className="cpc-nav">
      <a className="cpc-logo" onClick={() => navigate('/')}>
        <img src="/cpc-logo-primary.svg" alt="Coaches Pay Coaches" style={{ height: 44, width: 'auto', display: 'block' }} />
      </a>
      <ul className="nav-links">
        <li><a className={active === 'feed' ? 'active' : ''} onClick={() => navigate('/feed')}>Feed</a></li>
        <li><a className={active === 'marketplace' ? 'active' : ''} onClick={() => navigate('/marketplace')}>Browse</a></li>
        <li><a className={active === 'coaches' ? 'active' : ''} onClick={() => navigate('/coaches')}>Coaches</a></li>
        {user && (profile?.role === 'seller' || profile?.role === 'both') && (
          <li><a className={active === 'seller' ? 'active' : ''} onClick={() => navigate('/seller')}>My Store</a></li>
        )}
        {user && (profile?.role === 'buyer' || profile?.role === 'both') && (
          <li><a className={active === 'purchases' ? 'active' : ''} onClick={() => navigate('/purchases')}>My Library</a></li>
        )}
        {user && <NavMessagesLink />}
        {user ? (
          <li><a className="nav-cta" onClick={handleSignOut}>Sign Out</a></li>
        ) : (
          <li><a className="nav-cta" onClick={() => navigate('/auth')}>Get Started</a></li>
        )}
      </ul>
    </nav>
  )
}
