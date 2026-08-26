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
          <h2 style={{ fontFamily: 'var(--font-sub)', fontWeight: 900, fontSize: '1.4rem', textTransform: 'uppercase', margin: 0, color: 'var(--navy)' }}>
            Profile <em style={{ color: percent === 100 ? '#1a7a3e' : '#a9660b', fontStyle: 'normal' }}>{percent}%</em> Complete
          </h2>
        </div>
        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: '1rem', color: 'var(--muted-on-cream)' }}>
          {completed}/{total} done
        </div>
      </div>

      <div style={{ height: '6px', background: 'var(--border-on-cream)', borderRadius: '100px', marginBottom: '1.5rem', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${percent}%`,
          borderRadius: '100px',
          background: percent === 100 ? '#1a7a3e' : 'linear-gradient(90deg, var(--navy), #a9660b)',
          transition: 'width 0.4s ease'
        }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {checks.map((check, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '10px 14px', borderRadius: '8px', background: check.done ? 'var(--yellow-dim)' : 'var(--cream-card)', border: `1.5px solid ${check.done ? 'var(--navy)' : 'var(--border-on-cream)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                background: check.done ? 'var(--navy)' : 'transparent',
                border: check.done ? 'none' : '2px solid var(--border-on-cream)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', color: 'var(--yellow)', fontWeight: 900
              }}>
                {check.done ? '✓' : ''}
              </div>
              <span style={{ fontSize: '.88rem', color: check.done ? 'var(--muted-on-cream)' : 'var(--navy)', textDecoration: check.done ? 'line-through' : 'none' }}>
                {check.label}
              </span>
            </div>
            {!check.done && (
              <button
                className="btn btn-ghost-dark"
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