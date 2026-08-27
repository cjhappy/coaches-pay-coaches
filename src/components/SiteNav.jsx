import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NavMessagesLink from './NavMessagesLink'

export default function SiteNav({ active }) {
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    setMenuOpen(false)
    await signOut()
    navigate('/auth')
  }

  function go(path) {
    setMenuOpen(false)
    navigate(path)
  }

  return (
    <nav className="cpc-nav">
      <a className="cpc-logo" onClick={() => go('/')}>
        <img src="/cpc-logo-primary.svg" alt="Coaches Pay Coaches" style={{ height: 44, width: 'auto', display: 'block' }} />
      </a>

      <ul className="nav-links">
        <li><a className={active === 'feed' ? 'active' : ''} onClick={() => go('/feed')}>Feed</a></li>
        <li><a className={active === 'marketplace' ? 'active' : ''} onClick={() => go('/marketplace')}>Browse</a></li>
        <li><a className={active === 'coaches' ? 'active' : ''} onClick={() => go('/coaches')}>Coaches</a></li>
        {user && (profile?.role === 'seller' || profile?.role === 'both') && (
          <li><a className={active === 'seller' ? 'active' : ''} onClick={() => go('/seller')}>My Store</a></li>
        )}
        {user && (profile?.role === 'buyer' || profile?.role === 'both') && (
          <li><a className={active === 'purchases' ? 'active' : ''} onClick={() => go('/purchases')}>My Library</a></li>
        )}
        {user && <NavMessagesLink />}
        {user && <li><a className={active === 'dashboard' ? 'active' : ''} onClick={() => go('/dashboard')}>Dashboard</a></li>}
        {user && <li><a className={active === 'settings' ? 'active' : ''} onClick={() => go('/settings')}>Settings</a></li>}
        {profile?.is_admin && <li><a className={active === 'admin' ? 'active' : ''} onClick={() => go('/admin')}>Admin</a></li>}
        {user ? (
          <li><a className="nav-cta" onClick={handleSignOut}>Sign Out</a></li>
        ) : (
          <li><a className="nav-cta" onClick={() => go('/auth')}>Get Started</a></li>
        )}
      </ul>

      <button
        className="hamburger-btn"
        onClick={() => setMenuOpen(v => !v)}
        aria-label="Menu"
        aria-expanded={menuOpen}
      >
        <span style={menuOpen ? { transform: 'translateY(7px) rotate(45deg)' } : undefined} />
        <span style={menuOpen ? { opacity: 0 } : undefined} />
        <span style={menuOpen ? { transform: 'translateY(-7px) rotate(-45deg)' } : undefined} />
      </button>

      {menuOpen && (
        <>
          <div className="mobile-menu-backdrop" onClick={() => setMenuOpen(false)} />
          <div className="mobile-menu">
            <a className={active === 'feed' ? 'active' : ''} onClick={() => go('/feed')}>Feed</a>
            <a className={active === 'marketplace' ? 'active' : ''} onClick={() => go('/marketplace')}>Browse</a>
            <a className={active === 'coaches' ? 'active' : ''} onClick={() => go('/coaches')}>Coaches</a>
            {user && (profile?.role === 'seller' || profile?.role === 'both') && (
              <a className={active === 'seller' ? 'active' : ''} onClick={() => go('/seller')}>My Store</a>
            )}
            {user && (profile?.role === 'buyer' || profile?.role === 'both') && (
              <a className={active === 'purchases' ? 'active' : ''} onClick={() => go('/purchases')}>My Library</a>
            )}
            {user && <a onClick={() => go('/messages')}>Messages</a>}
            {user && <a className={active === 'dashboard' ? 'active' : ''} onClick={() => go('/dashboard')}>Dashboard</a>}
            {user && <a className={active === 'settings' ? 'active' : ''} onClick={() => go('/settings')}>Account Settings</a>}
            {profile?.is_admin && <a className="mobile-menu-admin" onClick={() => go('/admin')}>Admin</a>}
            <div className="mobile-menu-divider" />
            {user ? (
              <a className="mobile-menu-cta" onClick={handleSignOut}>Sign Out</a>
            ) : (
              <a className="mobile-menu-cta" onClick={() => go('/auth')}>Get Started →</a>
            )}
          </div>
        </>
      )}
    </nav>
  )
}
