import { useNavigate } from 'react-router-dom'
import { useUnreadMessages } from '../hooks/useUnreadMessages'

export default function NavMessagesLink() {
  const navigate = useNavigate()
  const unreadCount = useUnreadMessages()

  return (
    <li>
      <a onClick={() => navigate('/messages')} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        Messages
        {unreadCount > 0 && (
          <span style={{ background: 'var(--green)', color: 'var(--navy)', fontSize: '10px', fontWeight: 900, borderRadius: '100px', padding: '2px 6px', lineHeight: 1, fontFamily: 'Barlow Condensed, sans-serif' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </a>
    </li>
  )
}