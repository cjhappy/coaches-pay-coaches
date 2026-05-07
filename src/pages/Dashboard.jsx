import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import NavMessagesLink from '../components/NavMessagesLink'
import MobileNav from '../components/MobileNav'

function OnboardingGuide({ role }) {
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const isBuyer = role === 'buyer' || role === 'both'
  const isSeller = role === 'seller' || role === 'both'

  const buyerSteps = [
    { icon: '🔍', title: 'Browse the Marketplace', desc: 'Search by sport, category, or price to find coaching resources.', action: () => navigate('/marketplace'), cta: 'Browse Now' },
    { icon: '💳', title: 'Purchase a Resource', desc: 'Secure one-time checkout via Stripe. Instant access after payment.', action: () => navigate('/marketplace'), cta: 'Find Something' },
    { icon: '📥', title: 'Access Your Library', desc: 'All your purchased files live in My Library — download anytime.', action: () => navigate('/purchases'), cta: 'My Library' },
  ]

  const sellerSteps = [
    { icon: '🏦', title: 'Connect Stripe', desc: 'Go to My Store and connect your Stripe account to receive payouts.', action: () => navigate('/seller'), cta: 'My Store' },
    { icon: '📤', title: 'Upload a Resource', desc: 'Create your first listing — add a title, description, file, and price.', action: () => navigate('/seller'), cta: 'Create Listing' },
    { icon: '📣', title: 'Share Your Listing', desc: 'Copy your listing link and share it on social media to drive sales.', action: () => navigate('/marketplace'), cta: 'View Marketplace' },
  ]

  return (
    <div className="cpc-card" style={{ padding: '1.75rem', marginBottom: '2rem', borderColor: 'var(--green-border)', background: 'linear-gradient(135deg, rgba(46,204,113,0.04) 0%, transparent 60%)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="section-label" style={{ margin: 0, marginBottom: '4px' }}>Getting Started</div>
          <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '1.6rem', textTransform: 'uppercase', margin: 0 }}>
            Your <em style={{ color: 'var(--green)', fontStyle: 'normal' }}>Onboarding</em> Guide
          </h2>
        </div>
        <button
          className="btn btn-ghost"
          style={{ padding: '6px 14px', fontSize: '12px', opacity: 0.6 }}
          onClick={() => setDismissed(true)}
        >
          Dismiss
        </button>
      </div>

      {isBuyer && (
        <div style={{ marginBottom: isSeller ? '2rem' : 0 }}>
          {role === 'both' && (
            <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '.75rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '1rem' }}>
              As a Buyer
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {buyerSteps.map((step, i) => (
              <div key={i} style={{ background: 'var(--navy)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.4rem' }}>{step.icon}</span>
                  <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '.95rem', textTransform: 'uppercase' }}>
                    <span style={{ color: 'var(--green)', marginRight: '6px' }}>{i + 1}.</span>{step.title}
                  </div>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: '.82rem', lineHeight: 1.5, margin: 0 }}>{step.desc}</p>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '6px 12px', fontSize: '12px', marginTop: '4px', alignSelf: 'flex-start' }}
                  onClick={step.action}
                >
                  {step.cta} →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isSeller && (
        <div>
          {role === 'both' && (
            <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '.75rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '1rem' }}>
              As a Seller
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {sellerSteps.map((step, i) => (
              <div key={i} style={{ background: 'var(--navy)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.4rem' }}>{step.icon}</span>
                  <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '.95rem', textTransform: 'uppercase' }}>
                    <span style={{ color: 'var(--green)', marginRight: '6px' }}>{i + 1}.</span>{step.title}
                  </div>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: '.82rem', lineHeight: 1.5, margin: 0 }}>{step.desc}</p>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '6px 12px', fontSize: '12px', marginTop: '4px', alignSelf: 'flex-start' }}
                  onClick={step.action}
                >
                  {step.cta} →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <p style={{ color: 'var(--muted)', fontSize: '.78rem', marginTop: '1.25rem', marginBottom: 0 }}>
        All sales are final. Before purchasing, review our <a onClick={() => navigate('/refunds')} style={{ color: 'var(--green)', cursor: 'pointer', textDecoration: 'underline' }}>refund policy</a>.
      </p>
    </div>
  )
}

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
          <li><a onClick={() => navigate('/feed')}>Feed</a></li>
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
        <OnboardingGuide role={profile?.role} />

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