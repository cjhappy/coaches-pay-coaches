import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function BuyerCompleteness({ profile }) {
  const navigate = useNavigate()
  const [purchaseCount, setPurchaseCount] = useState(null)
  const [followCount, setFollowCount] = useState(null)

  useEffect(() => {
    if (!profile?.id) return
    supabase.from('purchases').select('id', { count: 'exact', head: true }).eq('buyer_id', profile.id)
      .then(({ count }) => setPurchaseCount(count || 0))
    supabase.from('followers').select('id', { count: 'exact', head: true }).eq('follower_id', profile.id)
      .then(({ count }) => setFollowCount(count || 0))
  }, [profile?.id])

  // Wait until both counts are in before deciding whether to show this at
  // all — showing it briefly and then hiding it looks broken.
  if (purchaseCount === null || followCount === null) return null

  const checks = [
    { label: 'Profile photo uploaded', done: !!profile?.avatar_url, action: () => navigate('/settings'), cta: 'Add Photo' },
    { label: 'Followed a coach', done: followCount > 0, action: () => navigate('/coaches'), cta: 'Find Coaches' },
    { label: 'Made your first purchase', done: purchaseCount > 0, action: () => navigate('/marketplace'), cta: 'Browse' },
  ]

  const completed = checks.filter(c => c.done).length
  const total = checks.length
  const percent = Math.round((completed / total) * 100)

  if (completed === total) return null

  return (
    <div className="cpc-card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="section-label" style={{ margin: 0, marginBottom: '4px' }}>Get the Most Out of CPC</div>
          <h2 style={{ fontFamily: 'var(--font-sub)', fontWeight: 900, fontSize: '1.4rem', textTransform: 'uppercase', margin: 0, color: 'var(--navy)' }}>
            Profile <em style={{ color: '#a9660b', fontStyle: 'normal' }}>{percent}%</em> Complete
          </h2>
        </div>
        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: '1rem', color: 'var(--muted-on-cream)' }}>
          {completed}/{total} done
        </div>
      </div>

      <div style={{ height: '6px', background: 'var(--border-on-cream)', borderRadius: '100px', marginBottom: '1.5rem', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${percent}%`, borderRadius: '100px', background: 'linear-gradient(90deg, var(--navy), #a9660b)', transition: 'width 0.4s ease' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {checks.map((check, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '10px 14px', borderRadius: '8px', background: check.done ? 'var(--yellow-dim)' : 'var(--cream-card)', border: `1.5px solid ${check.done ? 'var(--navy)' : 'var(--border-on-cream)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0, background: check.done ? 'var(--navy)' : 'transparent', border: check.done ? 'none' : '2px solid var(--border-on-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: 'var(--yellow)', fontWeight: 900 }}>
                {check.done ? '✓' : ''}
              </div>
              <span style={{ fontSize: '.88rem', color: check.done ? 'var(--muted-on-cream)' : 'var(--navy)', textDecoration: check.done ? 'line-through' : 'none' }}>
                {check.label}
              </span>
            </div>
            {!check.done && (
              <button className="btn btn-ghost-dark" style={{ padding: '5px 12px', fontSize: '11px', whiteSpace: 'nowrap', flexShrink: 0 }} onClick={check.action}>
                {check.cta} →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
