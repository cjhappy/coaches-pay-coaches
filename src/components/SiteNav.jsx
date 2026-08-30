import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useUnreadMessages } from '../hooks/useUnreadMessages'
import Avatar from './Avatar'

export default function SiteNav({ active }) {
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()
  const unreadCount = useUnreadMessages()
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)

  async function handleSignOut() {
    setMenuOpen(false)
    setAccountOpen(false)
    await signOut()
    navigate('/auth')
  }

  function go(path) {
    setMenuOpen(false)
    setAccountOpen(false)
    navigate(path)
  }

  const accountItems = [
    { label: 'Dashboard', path: '/dashboard', show: true, key: 'dashboard' },
    { label: 'My Store', path: '/seller', show: profile?.role === 'seller' || profile?.role === 'both', key: 'seller' },
    { label: 'My Library', path: '/purchases', show: profile?.role === 'buyer' || profile?.role === 'both', key: 'purchases' },
    { label: 'Messages', path: '/messages', show: true, key: 'messages', badge: unreadCount },
    { label: 'Account Settings', path: '/settings', show: true, key: 'settings' },
    { label: 'Admin', path: '/admin', show: !!profile?.is_admin, key: 'admin', admin: true },
  ].filter(i => i.show)

  return (
    <nav className="cpc-nav">
      <a className="cpc-logo" onClick={() => go('/')}>
        <img src="/cpc-logo-primary.svg" alt="Coaches Pay Coaches" style={{ height: 44, width: 'auto', display: 'block' }} />
      </a>

      {/* Desktop: primary content links, always visible */}
      <ul className="nav-links">
        <li><a className={active === 'marketplace' ? 'active' : ''} onClick={() => go('/marketplace')}>Browse</a></li>
        <li><a className={active === 'coaches' ? 'active' : ''} onClick={() => go('/coaches')}>Coaches</a></li>
        <li><a className={active === 'feed' ? 'active' : ''} onClick={() => go('/feed')}>Feed</a></li>

        {user ? (
          <li style={{ position: 'relative' }}>
            <a
              onClick={() => setAccountOpen(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 1 }}
            >
              <Avatar url={profile?.avatar_url} name={profile?.full_name} size={30} radius={8} />
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '9px', height: '9px', borderRadius: '50%', background: '#b91c1c', border: '2px solid var(--cream)' }} />
              )}
            </a>
            {accountOpen && (
              <>
                <div className="account-menu-backdrop" onClick={() => setAccountOpen(false)} />
                <div className="account-menu">
                  <div className="account-menu-name">{profile?.full_name}</div>
                  {accountItems.map(item => (
                    <a key={item.key} className={item.admin ? 'account-menu-admin' : ''} onClick={() => go(item.path)}>
                      {item.label}
                      {item.badge > 0 && <span className="account-menu-badge">{item.badge > 9 ? '9+' : item.badge}</span>}
                    </a>
                  ))}
                  <div className="account-menu-divider" />
                  <a onClick={handleSignOut}>Sign Out</a>
                </div>
              </>
            )}
          </li>
        ) : (
          <li><a className="nav-cta" onClick={() => go('/auth')}>Get Started</a></li>
        )}
      </ul>

      {/* Mobile / narrow window: hamburger with everything grouped */}
      <button className="hamburger-btn" onClick={() => setMenuOpen(v => !v)} aria-label="Menu" aria-expanded={menuOpen}>
        <span style={menuOpen ? { transform: 'translateY(7px) rotate(45deg)' } : undefined} />
        <span style={menuOpen ? { opacity: 0 } : undefined} />
        <span style={menuOpen ? { transform: 'translateY(-7px) rotate(-45deg)' } : undefined} />
      </button>

      {menuOpen && (
        <>
          <div className="mobile-menu-backdrop" onClick={() => setMenuOpen(false)} />
          <div className="mobile-menu">
            <a className={active === 'marketplace' ? 'active' : ''} onClick={() => go('/marketplace')}>Browse</a>
            <a className={active === 'coaches' ? 'active' : ''} onClick={() => go('/coaches')}>Coaches</a>
            <a className={active === 'feed' ? 'active' : ''} onClick={() => go('/feed')}>Feed</a>

            {user && (
              <>
                <div className="mobile-menu-section">Account</div>
                {accountItems.map(item => (
                  <a key={item.key} className={item.admin ? 'mobile-menu-admin' : ''} onClick={() => go(item.path)}>
                    {item.label}
                    {item.badge > 0 && <span className="account-menu-badge">{item.badge > 9 ? '9+' : item.badge}</span>}
                  </a>
                ))}
                <div className="mobile-menu-divider" />
                <a className="mobile-menu-cta" onClick={handleSignOut}>Sign Out</a>
              </>
            )}
            {!user && (
              <a className="mobile-menu-cta" onClick={() => go('/auth')}>Get Started →</a>
            )}
          </div>
        </>
      )}
    </nav>
  )
}
