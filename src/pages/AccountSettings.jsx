import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Helmet } from 'react-helmet-async'
import SiteNav from '../components/SiteNav'

function EmailForm({ currentEmail }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (!email || email === currentEmail) { setError('Enter a new email address.'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ email })
    setLoading(false)
    if (error) setError(error.message)
    else {
      setMessage('Check your new email address to confirm the change.')
      setEmail('')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="form-label">Current Email</label>
      <input className="form-input" value={currentEmail || ''} disabled style={{ opacity: .6, marginBottom: '1rem' }} />

      <label className="form-label">New Email</label>
      <input
        className="form-input"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="new@email.com"
        style={{ marginBottom: '1rem' }}
      />

      {error && <p className="auth-error" style={{ marginBottom: '1rem' }}>{error}</p>}
      {message && <p className="auth-message" style={{ marginBottom: '1rem' }}>{message}</p>}

      <button className="btn btn-green" type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Email'}
      </button>
    </form>
  )
}

function PasswordForm() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) setError(error.message)
    else {
      setMessage('Password updated successfully.')
      setPassword('')
      setConfirm('')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="form-label">New Password</label>
      <input
        className="form-input"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="••••••••"
        minLength={6}
        style={{ marginBottom: '1rem' }}
      />

      <label className="form-label">Confirm New Password</label>
      <input
        className="form-input"
        type="password"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        placeholder="••••••••"
        minLength={6}
        style={{ marginBottom: '1rem' }}
      />

      {error && <p className="auth-error" style={{ marginBottom: '1rem' }}>{error}</p>}
      {message && <p className="auth-message" style={{ marginBottom: '1rem' }}>{message}</p>}

      <button className="btn btn-green" type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  )
}

export default function AccountSettings() {
  const { user, profile } = useAuth()

  return (
    <div className="page-body cream-page">
      <Helmet>
        <title>Account Settings — Coaches Pay Coaches</title>
      </Helmet>
      <SiteNav active="settings" />

      <div className="dash-header">
        <div className="section-label">Account</div>
        <h1>Account <em>Settings</em></h1>
        <p>Manage your login email and password.</p>
      </div>

      <div className="dash-body" style={{ maxWidth: '520px' }}>
        <div className="cpc-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: '1.1rem', textTransform: 'uppercase', marginBottom: '1.25rem', color: 'var(--navy)' }}>
            Change Email
          </div>
          <EmailForm currentEmail={user?.email} />
        </div>

        <div className="cpc-card" style={{ padding: '1.75rem' }}>
          <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: '1.1rem', textTransform: 'uppercase', marginBottom: '1.25rem', color: 'var(--navy)' }}>
            Change Password
          </div>
          <PasswordForm />
        </div>

        <p className="muted" style={{ fontSize: '.8rem', marginTop: '1.5rem' }}>
          Signed in as {profile?.full_name} · {profile?.role}
        </p>
      </div>
    </div>
  )
}
