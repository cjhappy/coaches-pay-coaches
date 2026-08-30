import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import SellerCompleteness from '../components/SellerCompleteness'
import SiteNav from '../components/SiteNav'

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
    <div className="cpc-card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="section-label" style={{ margin: 0, marginBottom: '4px' }}>Getting Started</div>
          <h2 style={{ fontFamily: 'var(--font-sub)', fontWeight: 900, fontSize: '1.6rem', textTransform: 'uppercase', margin: 0, color: 'var(--navy)' }}>
            Your <em style={{ color: 'var(--navy)', fontStyle: 'normal', background: 'var(--yellow)', padding: '0 8px' }}>Onboarding</em> Guide
          </h2>
        </div>
        <button className="btn btn-ghost-dark" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={() => setDismissed(true)}>
          Dismiss
        </button>
      </div>

      {isBuyer && (
        <div style={{ marginBottom: isSeller ? '2rem' : 0 }}>
          {role === 'both' && (
            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: '.75rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted-on-cream)', marginBottom: '1rem' }}>
              As a Buyer
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {buyerSteps.map((step, i) => (
              <div key={i} style={{ background: 'var(--cream-card)', border: '1.5px solid var(--border-on-cream)', borderRadius: '10px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.4rem' }}>{step.icon}</span>
                  <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: '.95rem', textTransform: 'uppercase', color: 'var(--navy)' }}>
                    <span style={{ color: 'var(--muted-on-cream)', marginRight: '6px' }}>{i + 1}.</span>{step.title}
                  </div>
                </div>
                <p style={{ color: 'var(--muted-on-cream)', fontSize: '.82rem', lineHeight: 1.5, margin: 0 }}>{step.desc}</p>
                <button className="btn btn-ghost-dark" style={{ padding: '6px 12px', fontSize: '12px', marginTop: '4px', alignSelf: 'flex-start' }} onClick={step.action}>
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
            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: '.75rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted-on-cream)', marginBottom: '1rem' }}>
              As a Seller
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {sellerSteps.map((step, i) => (
              <div key={i} style={{ background: 'var(--cream-card)', border: '1.5px solid var(--border-on-cream)', borderRadius: '10px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.4rem' }}>{step.icon}</span>
                  <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: '.95rem', textTransform: 'uppercase', color: 'var(--navy)' }}>
                    <span style={{ color: 'var(--muted-on-cream)', marginRight: '6px' }}>{i + 1}.</span>{step.title}
                  </div>
                </div>
                <p style={{ color: 'var(--muted-on-cream)', fontSize: '.82rem', lineHeight: 1.5, margin: 0 }}>{step.desc}</p>
                <button className="btn btn-ghost-dark" style={{ padding: '6px 12px', fontSize: '12px', marginTop: '4px', alignSelf: 'flex-start' }} onClick={step.action}>
                  {step.cta} →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <p style={{ color: 'var(--muted-on-cream)', fontSize: '.78rem', marginTop: '1.25rem', marginBottom: 0 }}>
        All sales are final. Before purchasing, review our <a onClick={() => navigate('/refunds')} style={{ color: 'var(--navy)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>refund policy</a>.
      </p>
    </div>
  )
}

export default function Dashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [listings, setListings] = useState([])

  const isSeller = profile?.role === 'seller' || profile?.role === 'both'
  const isBuyer = profile?.role === 'buyer' || profile?.role === 'both'

  useEffect(() => {
    if (isSeller) fetchListings()
  }, [isSeller])

  async function fetchListings() {
    const { data, error } = await supabase
      .from('listings')
      .select('id, thumbnail_url')
      .eq('seller_id', profile.id)
    if (error) { console.error('Failed to load listings for dashboard:', error.message); return }
    if (data) setListings(data)
  }

  return (
    <div className="page-body cream-page">
      <SiteNav active="dashboard" />

      <div className="dash-header">
        <div className="section-label">Dashboard</div>
        <h1>Welcome, <em>{profile?.full_name?.split(' ')[0] || 'Coach'}</em></h1>
        <p>
          {profile?.role === 'both' ? 'You can buy and sell on Coaches Pay Coaches.' : `You're logged in as a `}
          {profile?.role !== 'both' && <strong style={{ color: 'var(--yellow)' }}>{profile?.role}</strong>}
        </p>
      </div>

      <div className="dash-body">
        <OnboardingGuide role={profile?.role} />

        {isSeller && (
          <SellerCompleteness profile={profile} listings={listings} />
        )}

        <div className="section-label">Quick Actions</div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <button className="btn btn-green" onClick={() => navigate('/marketplace')}>Browse Marketplace →</button>
          {isBuyer && <button className="btn btn-ghost-dark" onClick={() => navigate('/purchases')}>My Library</button>}
          {isSeller && <button className="btn btn-ghost-dark" onClick={() => navigate('/seller')}>My Store</button>}
        </div>
      </div>
    </div>
  )
}