import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import StarRating from './StarRating'

export default function ReviewForm({ listing, onSubmit }) {
  const { user, profile } = useAuth()
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hover, setHover] = useState(0)

  async function handleSubmit(e) {
    e.preventDefault()
    if (rating === 0) { setError('Please select a rating.'); return }
    setLoading(true)
    setError(null)

    const { error: insertError } = await supabase.from('reviews').insert({
      buyer_id: user.id,
      seller_id: listing.seller_id,
      listing_id: listing.id,
      rating,
      review
    })

    if (insertError) setError(insertError.message)
    else onSubmit()
    setLoading(false)
  }

  return (
    <div className="cpc-card" style={{ padding: '1.5rem', marginTop: '2rem' }}>
      <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '1.1rem', textTransform: 'uppercase', marginBottom: '1rem' }}>
        Leave a Review
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label className="form-label">Your Rating</label>
          <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <span
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                style={{
                  fontSize: '28px',
                  color: star <= (hover || rating) ? '#f59e0b' : 'var(--border)',
                  cursor: 'pointer',
                  transition: 'color .15s'
                }}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label className="form-label">Review (optional)</label>
          <textarea
            className="form-input"
            value={review}
            onChange={e => setReview(e.target.value)}
            rows={3}
            placeholder="Share your experience with this resource..."
            style={{ resize: 'vertical' }}
          />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="btn btn-green" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  )
}