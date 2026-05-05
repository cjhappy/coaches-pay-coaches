import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import '/src/auth.css'
export default function AuthForm({ onSuccess }) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
  const [role, setRole] = useState('buyer')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    if (mode === 'signup') {
      const { error } = await signUp({ email, password, fullName, role })
      if (error) setError(error.message)
      else setMessage('Check your email to confirm your account!')
    } else {
      const { error } = await signIn({ email, password })
      if (error) setError(error.message)
      else onSuccess?.()
    }
    setLoading(false)
  }

  return (
    <div className="auth-form-wrapper">
      <div className="auth-card">
        <h1 className="auth-logo">COACHES <span>PAY</span> COACHES</h1>
        <p className="auth-sub">{mode === 'login' ? 'Welcome back.' : 'Create your account.'}</p>
        <div className="auth-toggle">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')} type="button">Log In</button>
          <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')} type="button">Sign Up</button>
        </div>
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <>
              <label>Full Name
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" required />
              </label>
              <label>I am a...</label>
              <div className="role-picker">
                <button type="button" className={"role-btn " + (role === 'buyer' ? 'selected' : '')} onClick={() => setRole('buyer')}>
                  Buyer<span>Browse and purchase coaching materials</span>
                </button>
                <button type="button" className={"role-btn " + (role === 'seller' ? 'selected' : '')} onClick={() => setRole('seller')}>
                  Seller<span>List and sell your coaching materials</span>
                </button>
              </div>
            </>
          )}
          <label>Email
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="coach@example.com" required />
          </label>
          <label>Password
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
          </label>
          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-message">{message}</p>}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Loading...' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}