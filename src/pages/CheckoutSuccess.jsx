import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import SiteNav from '../components/SiteNav'

// Public landing page after a guest checkout completes. Guests have no
// account/session, so unlike a logged-in buyer (who lands on the
// auth-gated /purchases?success=true and can download right there), they
// can't be sent to a page that reads their purchase from the database.
// The actual download link is emailed to them separately by the Stripe
// webhook once payment is confirmed (this page renders immediately on
// Stripe's redirect, which can be a moment or two before that email goes
// out) — this page just confirms the purchase went through and tells them
// where to look next.
export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const hasSession = !!searchParams.get('session_id')

  return (
    <div className="page-body cream-page">
      <SiteNav active="marketplace" />
      <div style={{ padding: '4rem 5%', maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
        <div className="cpc-card" style={{ padding: '3rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{hasSession ? '✅' : '🤔'}</div>
          {hasSession ? (
            <>
              <h1 style={{ fontFamily: 'var(--font-sub)', fontWeight: 900, fontSize: '1.6rem', textTransform: 'uppercase', color: 'var(--navy)', marginBottom: '1rem' }}>
                Purchase Complete!
              </h1>
              <p className="muted" style={{ fontSize: '.95rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                Check your email for a download link — it should land within a minute or two. Be sure to check spam if you don't see it.
              </p>
              <p className="muted" style={{ fontSize: '.85rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Want your purchases saved in one place next time?{' '}
                <Link to="/auth" style={{ color: 'var(--navy)', fontWeight: 700, textDecoration: 'underline' }}>Create a free account</Link>{' '}
                with the same email and this purchase will show up in your library automatically.
              </p>
            </>
          ) : (
            <>
              <h1 style={{ fontFamily: 'var(--font-sub)', fontWeight: 900, fontSize: '1.6rem', textTransform: 'uppercase', color: 'var(--navy)', marginBottom: '1rem' }}>
                Nothing Here Yet
              </h1>
              <p className="muted" style={{ fontSize: '.95rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                This page confirms a checkout — looks like you landed here directly.
              </p>
            </>
          )}
          <button className="btn btn-green" onClick={() => navigate('/marketplace')}>Browse the Marketplace →</button>
        </div>
      </div>
    </div>
  )
}
