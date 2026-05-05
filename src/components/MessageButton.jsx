import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function MessageButton({ sellerId, listingId, listingTitle }) {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  async function handleMessage() {
    if (!user) { navigate('/auth'); return }
    if (user.id === sellerId) return
    setLoading(true)

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('buyer_id', user.id)
      .eq('seller_id', sellerId)
      .eq('listing_id', listingId)
      .maybeSingle()

    if (existing) {
      navigate('/messages?convo=' + existing.id)
    } else {
      const { data: newConvo } = await supabase
        .from('conversations')
        .insert({ buyer_id: user.id, seller_id: sellerId, listing_id: listingId })
        .select()
        .single()
      navigate('/messages?convo=' + newConvo.id)
    }

    setLoading(false)
  }

  if (user?.id === sellerId) return null

  return (
    <button
      className="btn btn-ghost"
      style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
      onClick={handleMessage}
      disabled={loading}
    >
      {loading ? 'Opening...' : 'Message Coach'}
    </button>
  )
}