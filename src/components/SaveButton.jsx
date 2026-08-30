import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function SaveButton({ listingId, dark, size = 'normal' }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!user) { setChecked(true); return }
    let cancelled = false
    supabase
      .from('saved_listings')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', listingId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) { setSaved(!!data); setChecked(true) }
      })
    return () => { cancelled = true }
  }, [user, listingId])

  async function toggle(e) {
    e.stopPropagation()
    if (!user) { navigate('/auth'); return }
    setLoading(true)
    if (saved) {
      await supabase.from('saved_listings').delete().eq('user_id', user.id).eq('listing_id', listingId)
      setSaved(false)
    } else {
      await supabase.from('saved_listings').insert({ user_id: user.id, listing_id: listingId })
      setSaved(true)
    }
    setLoading(false)
  }

  if (!checked) return null

  const iconSize = size === 'small' ? 16 : 20
  const padding = size === 'small' ? '6px' : '8px'

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={saved ? 'Remove from saved' : 'Save for later'}
      title={saved ? 'Remove from saved' : 'Save for later'}
      style={{
        background: dark ? 'rgba(255,255,255,0.08)' : 'var(--white)',
        border: `1.5px solid ${saved ? 'var(--navy)' : dark ? 'rgba(255,255,255,0.2)' : 'var(--border-on-cream)'}`,
        borderRadius: '8px',
        padding,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'all .15s'
      }}
    >
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill={saved ? 'var(--yellow)' : 'none'} stroke={saved ? 'var(--navy)' : (dark ? '#D2D1C4' : 'var(--navy)')} strokeWidth="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
