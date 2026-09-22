import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { notify } from '../lib/notify'

const COMMENT_LIMIT = 500

export default function CommentSection({ listing }) {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => { fetchComments() }, [listing.id])

  async function fetchComments() {
    const { data, error } = await supabase
      .from('listing_comments')
      .select('*, profiles(full_name, avatar_url, verified)')
      .eq('listing_id', listing.id)
      .order('created_at', { ascending: false })
    if (!error) setComments(data || [])
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) { navigate('/auth'); return }
    const trimmed = text.trim()
    if (!trimmed) return

    setSubmitting(true)
    setError(null)

    const { data, error: insertError } = await supabase
      .from('listing_comments')
      .insert({ listing_id: listing.id, user_id: user.id, comment: trimmed })
      .select('*, profiles(full_name, avatar_url, verified)')
      .single()

    if (insertError) {
      setError(insertError.message)
    } else {
      setComments(prev => [data, ...prev])
      setText('')
      notify({
        userId: listing.seller_id,
        type: 'comment',
        actorId: user.id,
        actorName: profile?.full_name,
        contentId: listing.id,
        contentTitle: listing.title,
      })
      notifyEmail(trimmed)
    }
    setSubmitting(false)
  }

  // Fire-and-forget — the in-app notification above always lands; this
  // just adds the email. A failure here should never surface as if the
  // comment itself failed to post.
  async function notifyEmail(commentText) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await fetch('/.netlify/functions/notify-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ listingId: listing.id, commentText })
      })
    } catch (err) {
      console.error('Comment email notification failed:', err.message)
    }
  }

  async function handleDelete(commentId) {
    if (!confirm('Delete this comment?')) return
    setDeletingId(commentId)
    const { error } = await supabase.from('listing_comments').delete().eq('id', commentId)
    if (error) {
      setError('Could not delete comment.')
    } else {
      setComments(prev => prev.filter(c => c.id !== commentId))
    }
    setDeletingId(null)
  }

  const canModerate = user?.id === listing.seller_id

  return (
    <div style={{ marginTop: '2.5rem' }}>
      <div className="section-label" style={{ marginBottom: '1.5rem' }}>
        Comments {comments.length > 0 && `(${comments.length})`}
      </div>

      <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
        <textarea
          className="form-input"
          value={text}
          onChange={e => setText(e.target.value.slice(0, COMMENT_LIMIT))}
          placeholder={user ? 'Ask a question or leave a comment...' : 'Log in to leave a comment'}
          rows={2}
          maxLength={COMMENT_LIMIT}
          style={{ resize: 'vertical', marginBottom: '.5rem' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="muted" style={{ fontSize: '.75rem' }}>{text.length}/{COMMENT_LIMIT}</span>
          <button type="submit" className="btn btn-green" style={{ padding: '8px 20px', fontSize: '13px' }} disabled={submitting || !text.trim()}>
            {submitting ? 'Posting...' : user ? 'Post Comment' : 'Log In to Comment'}
          </button>
        </div>
      </form>

      {error && <p className="auth-error" style={{ marginBottom: '1rem' }}>{error}</p>}

      {loading ? (
        <p className="muted" style={{ fontSize: '.9rem' }}>Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="muted" style={{ fontSize: '.9rem' }}>No comments yet. Be the first to ask a question.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {comments.map(comment => (
            <div key={comment.id} className="cpc-card" style={{ padding: '1.1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sub)', fontWeight: 900, fontSize: '10px', color: 'var(--navy)', flexShrink: 0 }}>
                    {comment.profiles?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
                  </div>
                  <span style={{ color: 'var(--navy)', fontSize: '.88rem', fontWeight: 700 }}>{comment.profiles?.full_name || 'Deleted user'}</span>
                  {comment.user_id === listing.seller_id && (
                    <span style={{ background: 'var(--yellow)', border: '1px solid var(--navy)', color: 'var(--navy)', fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '100px', letterSpacing: '.05em' }}>COACH</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="muted" style={{ fontSize: '.75rem' }}>{new Date(comment.created_at).toLocaleDateString()}</span>
                  {(user?.id === comment.user_id || canModerate) && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      disabled={deletingId === comment.id}
                      style={{ background: 'none', border: 'none', color: '#b91c1c', fontSize: '.75rem', cursor: 'pointer', padding: 0, opacity: 0.7 }}
                    >
                      {deletingId === comment.id ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </div>
              </div>
              <p className="muted" style={{ fontSize: '.88rem', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{comment.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
