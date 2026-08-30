import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Uncaught app error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          background: '#D2D1C4', padding: '2rem'
        }}>
          <img src="/cpc-logo-primary.svg" alt="Coaches Pay Coaches" style={{ height: 44, marginBottom: '2rem' }} />
          <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: '2rem', color: '#0D3247', textTransform: 'uppercase', marginBottom: '.75rem' }}>
            Something Went Wrong
          </h1>
          <p style={{ color: '#5B6B74', fontSize: '.95rem', maxWidth: '420px', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            We hit an unexpected error. Try reloading the page — if it keeps happening, let us know at{' '}
            <a href="mailto:christopherhappy05@gmail.com" style={{ color: '#0D3247', fontWeight: 700 }}>
              christopherhappy05@gmail.com
            </a>.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#0D3247', color: '#FDFB54', border: 'none', borderRadius: '8px',
              padding: '12px 28px', fontFamily: "'Archivo Condensed', sans-serif", fontWeight: 700,
              fontSize: '14px', textTransform: 'uppercase', letterSpacing: '.3px', cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
