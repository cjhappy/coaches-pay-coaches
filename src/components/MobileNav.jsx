import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useUnreadMessages } from '../hooks/useUnreadMessages'

export default function MobileNav() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const unreadCount = useUnreadMessages()

  const active = (path) => location.pathname.startsWith(path)

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '64px',
      background: '#0b1622',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 999,
      paddingBottom: 'env(safe-area-inset-bottom)'
    }} className="mobile-bottom-nav">
      <NavItem label="Browse" onClick={() => navigate('/marketplace')} active={active('/marketplace') || active('/listing')} />
      <NavItem label="Coaches" onClick={() => navigate('/coaches')} active={active('/coaches') || active('/coach')} />
      {user && <NavItem label="Messages" onClick={() => navigate('/messages')} active={active('/messages')} badge={unreadCount} />}
      {user && (profile?.role === 'seller' || profile?.role === 'both') && (
        <NavItem label="Store" onClick={() => navigate('/seller')} active={active('/seller')} />
      )}
      {user && (profile?.role === 'buyer' || profile?.role === 'both') && (
        <NavItem label="Library" onClick={() => navigate('/purchases')} active={active('/purchases')} />
      )}
      {!user && (
        <NavItem label="Sign In" onClick={() => navigate('/auth')} active={active('/auth')} />
      )}
    </div>
  )
}

function NavItem({ label, onClick, active, badge }) {
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
        gap: '4px',
        padding: '4px 10px',
        position: 'relative',
        flex: 1
      }}
    >
      <div style={{
        width: '28px',
        height: '3px',
        borderRadius: '2px',
        background: active ? '#2ecc71' : 'transparent',
        marginBottom: '2px',
        transition: 'background .2s'
      }} />
      <span style={{
        fontSize: '11px',
        fontFamily: 'Barlow Condensed, sans-serif',
        fontWeight: active ? 800 : 600,
        textTransform: 'uppercase',
        letterSpacing: '.08em',
        color: active ? '#2ecc71' : '#7a95ae',
        transition: 'color .2s'
      }}>{label}</span>
      {badge > 0 && (
        <span style={{
          position: 'absolute',
          top: '4px',
          right: 'calc(50% - 20px)',
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