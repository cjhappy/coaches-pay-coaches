import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SiteFooter() {
  const navigate = useNavigate()
  const { profile } = useAuth()

  return (
    <footer className="site-footer">
      <span className="site-footer-brand">
        <img src="/cpc-badge.svg" alt="" className="site-footer-badge" />
        <span className="site-footer-copy">© {new Date().getFullYear()} Coaches Pay Coaches</span>
      </span>
      <span className="site-footer-links">
        <a href="/onboarding-guide.pdf" download>Getting Started Guide</a>
        <a onClick={() => navigate('/terms')}>Terms</a>
        <a onClick={() => navigate('/privacy')}>Privacy</a>
        <a onClick={() => navigate('/refunds')}>Refunds</a>
        {profile && <a onClick={() => navigate('/settings')}>Account Settings</a>}
        {profile?.is_admin && <a onClick={() => navigate('/admin')} className="site-footer-admin">Admin</a>}
      </span>
    </footer>
  )
}
