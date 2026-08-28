import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const REASONS = ['Spam or misleading', 'Inappropriate content', 'Harassment', 'Not coaching-related', 'Other']

export default function ReportButton({ contentType, contentId, reportedUserId, contentSnapshot, dark }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit() {
    if (!user) { navigate('/auth'); return }
    if (!reason) return
    setSubmitting(true)
    const { error } = await supabase.from('reports').insert({
      reporter_id: user.id,
      reported_user_id: reportedUserId || null,
      content_type: contentType,
      content_id: contentId,
      content_snapshot: (contentSnapshot || '').slice(0, 500),
      reason: note ? `${reason} — ${note}` : reason,
    })
    setSubmitting(false)
    if (!error) {
      setDone(true)
      setTimeout(() => setOpen(false), 1500)
    }
  }

  if (!user) return null

  const linkColor = dark ? 'var(--muted)' : 'var(--muted-on-cream)'

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => { setOpen(v => !v); setDone(false) }}
        style={{ background: 'transparent', border: 'none', color: linkColor, cursor: 'pointer', fontSize: '.78rem', padding: '2px 4px' }}
      >
        Report
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: '6px', zIndex: 50,
          width: '260px', background: 'var(--white)', border: '1.5px solid var(--navy)',
          borderRadius: '10px', padding: '14px', boxShadow: '0 8px 20px rgba(13,50,71,0.2)'
        }}>
          {done ? (
            <p style={{ color: 'var(--navy)', fontSize: '.85rem', margin: 0 }}>Thanks — our team will take a look.</p>
          ) : (
            <>
              <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: '.8rem', textTransform: 'uppercase', color: 'var(--navy)', marginBottom: '8px' }}>
                Report {contentType}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                {REASONS.map(r => (
                  <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.8rem', color: 'var(--navy)', cursor: 'pointer' }}>
                    <input type="radio" name="report-reason" checked={reason === r} onChange={() => setReason(r)} />
                    {r}
                  </label>
                ))}
              </div>
              <textarea
                placeholder="Add details (optional)"
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={2}
                style={{
                  width: '100%', fontSize: '.8rem', marginBottom: '8px', resize: 'vertical',
                  background: 'var(--white)', color: 'var(--navy)', border: '1.5px solid var(--border-on-cream)',
                  borderRadius: '8px', padding: '.6rem .8rem', fontFamily: 'var(--font-body)', boxSizing: 'border-box'
                }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-green" style={{ padding: '6px 14px', fontSize: '11px', flex: 1 }} disabled={!reason || submitting} onClick={handleSubmit}>
                  {submitting ? 'Sending...' : 'Submit'}
                </button>
                <button className="btn btn-ghost-dark" style={{ padding: '6px 14px', fontSize: '11px' }} onClick={() => setOpen(false)}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </span>
  )
}
