import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../hooks/useNotifications'

const MESSAGES = {
  follow: (n) => `${n.actor_name || 'A coach'} started following you`,
  review: (n) => `${n.actor_name || 'A coach'} reviewed "${n.content_title || 'your listing'}"`,
  sale: (n) => `${n.actor_name || 'A coach'} purchased "${n.content_title || 'your listing'}"`,
}

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return minutes + 'm ago'
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return hours + 'h ago'
  const days = Math.floor(hours / 24)
  if (days < 7) return days + 'd ago'
  return new Date(dateStr).toLocaleDateString()
}

export default function NotificationBell() {
  const navigate = useNavigate()
  const { notifications, unreadCount, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)

  function handleOpen() {
    const next = !open
    setOpen(next)
    if (next) markAllRead()
  }

  function handleClick(n) {
    setOpen(false)
    if (n.type === 'follow') navigate('/coach/' + n.actor_id)
    else if (n.type === 'review') navigate('/listing/' + n.content_id)
    else if (n.type === 'sale') navigate('/seller')
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={handleOpen}
        aria-label="Notifications"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', position: 'relative' }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span style={{ position: 'absolute', top: '2px', right: '2px', width: '9px', height: '9px', borderRadius: '50%', background: '#b91c1c', border: '2px solid var(--cream)' }} />
        )}
      </button>

      {open && (
        <>
          <div className="account-menu-backdrop" onClick={() => setOpen(false)} />
          <div className="account-menu" style={{ width: '300px' }}>
            <div className="account-menu-name">Notifications</div>
            {notifications.length === 0 ? (
              <div style={{ padding: '16px 10px', textAlign: 'center', color: 'var(--muted-on-cream)', fontSize: '13px' }}>
                Nothing yet — check back later.
              </div>
            ) : (
              <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                {notifications.map(n => (
                  <a
                    key={n.id}
                    onClick={() => handleClick(n)}
                    style={{
                      display: 'block', padding: '10px', lineHeight: 1.4,
                      background: n.read ? 'transparent' : 'rgba(253,251,84,0.15)'
                    }}
                  >
                    <div style={{ fontSize: '13px', color: 'var(--navy)', fontWeight: n.read ? 500 : 700 }}>
                      {MESSAGES[n.type] ? MESSAGES[n.type](n) : 'New notification'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--muted-on-cream)', marginTop: '2px' }}>
                      {timeAgo(n.created_at)}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
