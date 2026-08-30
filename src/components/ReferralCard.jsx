import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function ReferralCard({ profile }) {
  const [copied, setCopied] = useState(false)
  const [referredCount, setReferredCount] = useState(null)

  useEffect(() => {
    if (!profile?.id) return
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('referred_by', profile.id)
      .then(({ count }) => setReferredCount(count || 0))
  }, [profile?.id])

  if (!profile?.referral_code) return null

  const link = `https://coachespaycoaches.org/auth?ref=${profile.referral_code}`

  function handleCopy() {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="cpc-card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
      <div className="section-label" style={{ marginBottom: '4px' }}>Invite Coaches</div>
      <h2 style={{ fontFamily: 'var(--font-sub)', fontWeight: 900, fontSize: '1.4rem', textTransform: 'uppercase', margin: 0, marginBottom: '.5rem', color: 'var(--navy)' }}>
        Share Your Link
      </h2>
      <p style={{ color: 'var(--muted-on-cream)', fontSize: '.88rem', lineHeight: 1.6, marginBottom: '1rem' }}>
        Invite other coaches to Coaches Pay Coaches — a personal recommendation is worth more than any ad.
        {referredCount !== null && referredCount > 0 && (
          <> So far, <strong style={{ color: 'var(--navy)' }}>{referredCount} coach{referredCount !== 1 ? 'es' : ''}</strong> joined through your link.</>
        )}
      </p>
      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
        <input
          readOnly
          value={link}
          onClick={e => e.target.select()}
          style={{
            flex: 1, minWidth: '220px', background: 'var(--cream-card)', border: '1.5px solid var(--border-on-cream)',
            borderRadius: '8px', padding: '.6rem .9rem', color: 'var(--navy)', fontSize: '.85rem', fontFamily: 'var(--font-body)'
          }}
        />
        <button className="btn btn-green" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>
    </div>
  )
}
