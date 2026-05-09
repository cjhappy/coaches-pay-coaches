import { useNavigate } from 'react-router-dom'

export default function SellerCompleteness({ profile, listings, onConnectStripe }) {
  const navigate = useNavigate()

  const checks = [
    {
      label: 'Profile photo uploaded',
      done: !!profile?.avatar_url,
      action: () => navigate('/seller'),
      cta: 'Upload Photo',
    },
    {
      label: 'Bio written',
      done: !!profile?.bio && profile.bio.trim().length > 0,
      action: () => navigate('/seller'),
      cta: 'Write Bio',
    },
    {
      label: 'Stripe connected',
      done: !!profile?.stripe_account_id,
      action: () => onConnectStripe ? onConnectStripe() : navigate('/seller'),
      cta: 'Connect Stripe',
    },
    {
      label: 'Stripe fully active (charges & payouts enabled)',
      done: !!profile?.stripe_charges_enabled && !!profile?.stripe_payouts_enabled,
      action: () => onConnectStripe ? onConnectStripe() : navigate('/seller'),
      cta: 'Finish Setup',
    },
    {
      label: 'At least one listing published',
      done: listings && listings.length > 0,
      action: () => navigate('/seller'),
      cta: 'Create Listing',
    },
    {
      label: 'Listing has a thumbnail',
      done: listings && listings.some(l => !!l.thumbnail_url),
      action: () => navigate('/seller'),
      cta: 'Add Thumbnail',
    },
  ]

  const completed = checks.filter(c => c.done).length
  const total = checks.length
  const percent = Math.round((completed / total) * 100)
  const allDone = completed === total

  if (allDone) return null

  return (
    <div className="cpc-card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="section-label" style={{ margin: 0, marginBottom: '4px' }}>Seller Profile</div>
          <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '1.4rem', textTransform: 'uppercase', margin: 0 }}>
            Profile <em style={{ color: percent === 100 ? 'var(--green)' : '#fbbf24', fontStyle: 'normal' }}>{percent}%</em> Complete
          </h2>
        </div>
        <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--muted)' }}>
          {completed}/{total} done
        </div>
      </div>

      <div style={{ height: '6px', background: 'var(--border)', borderRadius: '100px', marginBottom: '1.5rem', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${percent}%`,
          borderRadius: '100px',
          background: percent === 100 ? 'var(--green)' : 'linear-gradient(90deg, var(--green), #fbbf24)',
          transition: 'width 0.4s ease'
        }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {checks.map((check, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '10px 14px', borderRadius: '8px', background: check.done ? 'rgba(46,204,113,0.04)' : 'var(--navy)', border: `1px solid ${check.done ? 'var(--green-border)' : 'var(--border)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                background: check.done ? 'var(--green)' : 'transparent',
                border: check.done ? 'none' : '2px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', color: 'var(--navy)', fontWeight: 900
              }}>
                {check.done ? '✓' : ''}
              </div>
              <span style={{ fontSize: '.88rem', color: check.done ? 'var(--muted)' : 'var(--off)', textDecoration: check.done ? 'line-through' : 'none' }}>
                {check.label}
              </span>
            </div>
            {!check.done && (
              <button
                className="btn btn-ghost"
                style={{ padding: '5px 12px', fontSize: '11px', whiteSpace: 'nowrap', flexShrink: 0 }}
                onClick={check.action}
              >
                {check.cta} →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}