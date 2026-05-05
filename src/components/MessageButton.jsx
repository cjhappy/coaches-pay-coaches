import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function MessageButton({ sellerId, listingId, listingTitle }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  async function handleMessage() {
    if (!user) { navigate('/auth'); return }
    if (user.id === sellerId) return
    setLoading(true)

    try {
      let query = supabase
        .from('conversations')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('seller_id', sellerId)

      if (listingId) {
        query = query.eq('listing_id', listingId)
      } else {
        query = query.is('listing_id', null)
      }

      const { data: existing } = await query.maybeSingle()

      if (existing) {
        navigate('/messages?convo=' + existing.id)
      } else {
        const { data: newConvo, error } = await supabase
          .from('conversations')
          .insert({
            buyer_id: user.id,
            seller_id: sellerId,
            listing_id: listingId || null
          })
          .select()
          .single()

        if (error) throw error
        navigate('/messages?convo=' + newConvo.id)
      }
    } catch (err) {
      console.error(err)
    }

    setLoading(false)
  }

  if (user?.id === sellerId) return null

  return (
    <button
      className="btn btn-ghost"
      style={{ padding: '10px 28px' }}
      onClick={handleMessage}
      disabled={loading}
    >
      {loading ? 'Opening...' : 'Message Coach'}
    </button>
  )
}