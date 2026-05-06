import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useUnreadMessages } from '../hooks/useUnreadMessages'

export default function MobileNav() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const unreadCount = useUnreadMessages()

  if (!user) return null

  const active = (path) => location.pathname === path

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '60px',
      background: '#0b1622',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 999,
      paddingBottom: 'env(safe-area-inset-bottom)'
    }} className="mobile-bottom-nav">
      <NavItem icon="🏠" label="Home" onClick={() => navigate('/dashboard')} active={active('/dashboard')} />
      <NavItem icon="🛒" label="Browse" onClick={() => navigate('/marketplace')} active={active('/marketplace')} />
      <NavItem icon="👥" label="Coaches" onClick={() => navigate('/coaches')} active={active('/coaches')} />
      <NavItem
        icon="💬"
        label="Messages"
        onClick={() => navigate('/messages')}
        active={active('/messages')}
        badge={unreadCount}
      />
      {(profile?.role === 'seller' || profile?.role === 'both') && (
        <NavItem icon="🏪" label="Store" onClick={() => navigate('/seller')} active={active('/seller')} />
      )}
      {(profile?.role === 'buyer' || profile?.role === 'both') && (
        <NavItem icon="📚" label="Library" onClick={() => navigate('/purchases')} active={active('/purchases')} />
      )}
    </div>
  )
}

function NavItem({ icon, label, onClick, active, badge }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px',
        padding: '4px 8px',
        position: 'relative'
      }}
    >
      <span style={{ fontSize: '20px' }}>{icon}</span>
      <span style={{
        fontSize: '9px',
        fontFamily: 'Barlow Condensed, sans-serif',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '.05em',
        color: active ? '#2ecc71' : '#7a95ae'
      }}>{label}</span>
      {badge > 0 && (
        <span style={{
          position: 'absolute',
          top: 0,
          right: 0,
          background: '#2ecc71',
          color: '#0b1622',
          fontSize: '9px',
          fontWeight: 900,
          borderRadius: '100px',
          padding: '1px 5px',
          lineHeight: 1.4
        }}>{badge > 9 ? '9+' : badge}</span>
      )}
    </button>
  )
}