import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useUnreadMessages } from '../hooks/useUnreadMessages'

export default function MobileNav() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640)
  const unreadCount = useUnreadMessages()

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 640)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!isMobile) return null

  async function handleSignOut() {
    await signOut()
    navigate('/auth')
    setOpen(false)
  }

  function go(path) {
    navigate(path)
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '8px',
          cursor: 'pointer',
          padding: '8px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001,
          position: 'relative'
        }}
      >
        <span style={{ display: 'block', width: '20px', height: '2px', background: open ? '#2ecc71' : '#dce8f2', transition: 'all .2s', transform: open ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
        <span style={{ display: 'block', width: '20px', height: '2px', background: open ? 'transparent' : '#dce8f2', transition: 'all .2s' }} />
        <span style={{ display: 'block', width: '20px', height: '2px', background: open ? '#2ecc71' : '#dce8f2', transition: 'all .2s', transform: open ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
      </button>

      {open && (
        <div style={{
          position: 'fixed',
          top: '66px',
          left: 0,
          right: 0,
          bottom: 0,
          background: '#0b1622',
          zIndex: 1000,
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          flexDirection: 'column',
          padding: '1rem 1.5rem',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <button onClick={() => go('/marketplace')} style={linkStyle}>Marketplace</button>
            <button onClick={() => go('/coaches')} style={linkStyle}>Coaches</button>
            {(profile?.role === 'seller' || profile?.role === 'both') && (
              <button onClick={() => go('/seller')} style={linkStyle}>My Store</button>
            )}
            {(profile?.role === 'buyer' || profile?.role === 'both') && (
              <button onClick={() => go('/purchases')} style={linkStyle}>My Library</button>
            )}
            {user && (
              <button onClick={() => go('/messages')} style={linkStyle}>
                Messages
                {unreadCount > 0 && (
                  <span style={{ background: '#2ecc71', color: '#0b1622', fontSize: '11px', fontWeight: 900, borderRadius: '100px', padding: '2px 8px', marginLeft: '8px' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}
            {profile?.is_admin && (
              <button onClick={() => go('/admin')} style={linkStyle}>Admin</button>
            )}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            {user ? (
              <button
                onClick={handleSignOut}
                style={{ width: '100%', padding: '14px', background: '#2ecc71', color: '#0b1622', border: 'none', borderRadius: '8px', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase', cursor: 'pointer' }}
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => go('/auth')}
                style={{ width: '100%', padding: '14px', background: '#2ecc71', color: '#0b1622', border: 'none', borderRadius: '8px', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase', cursor: 'pointer' }}
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}

const linkStyle = {
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid rgba(255,255,255,0.07)',
  color: '#dce8f2',
  fontFamily: 'Barlow Condensed, sans-serif',
  fontWeight: 700,
  fontSize: '1.2rem',
  textTransform: 'uppercase',
  letterSpacing: '.05em',
  cursor: 'pointer',
  padding: '1.1rem 0',
  textAlign: 'left',
  width: '100%'
}