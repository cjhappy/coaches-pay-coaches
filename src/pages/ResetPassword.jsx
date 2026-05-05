import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) { setError("Passwords don't match."); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setError(error.message)
    else {
      setMessage('Password updated! Redirecting...')
      setTimeout(() => navigate('/dashboard'), 2000)
    }
    setLoading(false)
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="badge">CPC</div>
          COACHES <em>PAY</em> COACHES
        </div>
        <p className="auth-sub">Choose a new password.</p>
        <form onSubmit={handleSubmit}>
          <label>New Password
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
          </label>
          <label>Confirm Password
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" required minLength={6} />
          </label>
          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-message">{message}</p>}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password →'}
          </button>
        </form>
      </div>
    </div>
  )
}