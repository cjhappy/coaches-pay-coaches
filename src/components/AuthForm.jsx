import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function AuthForm({ onSuccess }) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
  const [roles, setRoles] = useState({ buyer: true, seller: false })
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [forgotPassword, setForgotPassword] = useState(false)

  function toggleRole(r) {
    setRoles(prev => {
      const next = { ...prev, [r]: !prev[r] }
      if (!next.buyer && !next.seller) return prev
      return next
    })
  }

  function getRole() {
    if (roles.buyer && roles.seller) return 'both'
    if (roles.seller) return 'seller'
    return 'buyer'
  }

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
      const { error } = await signUp({ email, password, fullName, role: getRole() })
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

              <label style={{ marginBottom: '.5rem' }}>I want to... (select all that apply)</label>
              <div className="role-picker">
                <button
                  type="button"
                  className={"role-btn " + (roles.buyer ? 'selected' : '')}
                  onClick={() => toggleRole('buyer')}
                >
                  🛒 Buy
                  <span>Browse & purchase materials</span>
                </button>
                <button
                  type="button"
                  className={"role-btn " + (roles.seller ? 'selected' : '')}
                  onClick={() => toggleRole('seller')}
                >
                  📦 Sell
                  <span>List & sell my materials</span>
                </button>
              </div>
              {roles.buyer && roles.seller && (
                <p style={{ color: 'var(--green)', fontSize: '.78rem', marginTop: '.5rem' }}>✓ You'll be able to both buy and sell</p>
              )}
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