import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function AuthForm({ onSuccess }) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
  const [role, setRole] = useState('buyer')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [forgotPassword, setForgotPassword] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    if (forgotPassword) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://coachespaycoaches.org/reset-password'
      })
      if (error) setError(error.message)
      else setMessage('Check your email for a password reset link!')
      setLoading(false)
      return
    }

    if (mode === 'signup') {
      const { error } = await signUp({ email, password, fullName, role })
      if (error) setError(error.message)
      else setMessage('Check your email to confirm your account!')
    } else {
      const { error } = await signIn({ email, password, rememberMe })
      if (error) setError(error.message)
      else onSuccess?.()
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
        <p className="auth-sub">
          {forgotPassword ? 'Reset your password.' : mode === 'login' ? 'Welcome back, Coach.' : 'Join the community.'}
        </p>

        {!forgotPassword && (
          <div className="auth-toggle">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')} type="button">Log In</button>
            <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')} type="button">Sign Up</button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && !forgotPassword && (
            <>
              <label>Full Name
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" required />
              </label>
              <label>I am a...</label>
              <div className="role-picker">
                <button type="button" className={"role-btn " + (role === 'buyer' ? 'selected' : '')} onClick={() => setRole('buyer')}>
                  🛒 Buyer
                  <span>Browse & purchase materials</span>
                </button>
                <button type="button" className={"role-btn " + (role === 'seller' ? 'selected' : '')} onClick={() => setRole('seller')}>
                  📦 Seller
                  <span>List & sell your materials</span>
                </button>
              </div>
            </>
          )}

          <label>Email
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="coach@example.com" required />
          </label>

          {!forgotPassword && (
            <label>Password
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
            </label>
          )}

          {mode === 'login' && !forgotPassword && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setRememberMe(!rememberMe)}>
                <div style={{
                  width: '18px', height: '18px', borderRadius: '4px',
                  border: '1px solid', borderColor: rememberMe ? 'var(--green)' : 'var(--border)',
                  background: rememberMe ? 'var(--green)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all .2s'
                }}>
                  {rememberMe && <span style={{ color: 'var(--navy)', fontSize: '11px', fontWeight: 900 }}>✓</span>}
                </div>
                <span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Remember me</span>
              </div>
              <button type="button" onClick={() => { setForgotPassword(true); setError(null); setMessage(null) }} style={{ background: 'none', border: 'none', color: 'var(--green)', fontSize: '.85rem', cursor: 'pointer', padding: 0 }}>
                Forgot password?
              </button>
            </div>
          )}

          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-message">{message}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Loading...' : forgotPassword ? 'Send Reset Link →' : mode === 'login' ? 'Log In →' : 'Create Account →'}
          </button>

          {forgotPassword && (
            <button type="button" onClick={() => { setForgotPassword(false); setError(null); setMessage(null) }} style={{ width: '100%', marginTop: '.75rem', padding: '.75rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--muted)', cursor: 'pointer', fontSize: '.9rem' }}>
              Back to Login
            </button>
          )}
        </form>
      </div>
    </div>
  )
}