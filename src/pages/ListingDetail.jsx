import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function CopyLinkButton({ url }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      style={{
        display: 'flex', alignItems: 'center', gap: '.75rem',
        padding: '.75rem 1rem', background: 'var(--navy)',
        border: '1px solid var(--border)', borderRadius: '8px',
        color: 'var(--off)', cursor: 'pointer',
        fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
        fontSize: '.85rem', textTransform: 'uppercase',
        letterSpacing: '.05em', width: '100%', textAlign: 'left'
      }}
    >
      {copied ? 'Copied!' : 'Copy Link'}
    </button>
  )
}

function ShareCard({ url, title }) {
  const shareText = 'Check out "' + title + '" on Coaches Pay Coaches'
  const twitterUrl = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText) + '&url=' + encodeURIComponent(url) + '&hashtags=coaching,youthsports'

  return (
    <div className="cpc-card" style={{ padding: '1.25rem' }}>
      <div style={{
        fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
        fontSize: '.85rem', textTransform: 'uppercase',
        letterSpacing: '.05em', color: 'var(--muted)', marginBottom: '1rem'
      }}>
        Share This Resource
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: '.75rem',
            padding: '.75rem 1rem', background: '#000',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
            color: '#fff', textDecoration: 'none',
            fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
            fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '.05em'
          }}
        >
          X — Share on X (Twitter)
        </a>
        <button
          onClick={() => {
            navigator.clipboard.writeText(url)
            alert('Link copied! Paste it in your Instagram bio, story, or DM.')
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: '.75rem',
            padding: '.75rem 1rem',
            background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
            border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer',
            fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
            fontSize: '.85rem', textTransform: 'uppercase',
            letterSpacing: '.05em', width: '100%', textAlign: 'left'
          }}
        >
          Copy Link for Instagram
        </button>
        <CopyLinkButton url={url} />
      </div>
    </div>
  )
}

export default function ListingDetail() {
  const { id } = useParams()
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => { fetchListing() }, [id])

  async function fetchListing() {
    const { data, error } = await supabase
      .from('listings')
      .select('*, profiles(full_name, stripe_account_id)')
      .eq('id', id)
      .single()
    if (!error) setListing(data)
    setLoading(false)
  }

  async function handlePurchase() {
    setPurchasing(true)
    setError(null)
    try {
      const res = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          buyerId: profile.id,
          returnUrl: window.location.origin
        })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      window.location.href = data.url
    } catch (err) {
      setError(err.message)
    }
    setPurchasing(false)
  }

  async function handleDownload() {
    const { data, error } = await supabase.storage
      .from('listings-files')
      .createSignedUrl(listing.file_url, 60)
    if (error) setError('Could not generate download link.')
    else window.open(data.signedUrl, '_blank')
  }

  async function handleSignOut() {
    await signOut()
    navigate('/auth')
  }

  if (loading) return <div className="page-body" style={{ padding: '4rem 5%', color: 'var(--muted)' }}>Loading...</div>
  if (!listing) return <div className="page-body" style={{ padding: '4rem 5%', color: 'var(--muted)' }}>Listing not found.</div>

  const sellerReady = !!listing.profiles?.stripe_account_id
  const isOwnListing = user?.id === listing.seller_id
  const shareUrl = 'https://coachespaycoaches.org/listing/' + listing.id

  return (
    <div className="page-body">
      <nav className="cpc-nav">
        <a className="cpc-logo" onClick={() => navigate('/')}>
          <div className="logo-badge">CPC</div>
          <div className="logo-text">COACHES <em>PAY</em> COACHES</div>
        </a>
        <ul className="nav-links">
          <li><a onClick={() => navigate('/marketplace')}>Marketplace</a></li>
          <li><a onClick={() => navigate('/coaches')}>Coaches</a></li>
          {(profile?.role === 'seller' || profile?.role === 'both') && (
            <li><a onClick={() => navigate('/seller')}>My Store</a></li>
          )}
          {(profile?.role === 'buyer' || profile?.role === 'both') && (
            <li><a onClick={() => navigate('/purchases')}>My Library</a></li>
          )}
          {user ? (
            <li><a className="nav-cta" onClick={handleSignOut}>Sign Out</a></li>
          ) : (
            <li><a className="nav-cta" onClick={() => navigate('/auth')}>Get Started</a></li>
          )}
        </ul>
      </nav>

      <div style={{ padding: '2.5rem 5%', maxWidth: '900px', margin: '0 auto' }}>
        <button
          className="btn btn-ghost"
          style={{ padding: '8px 16px', fontSize: '13px', marginBottom: '2rem' }}
          onClick={() => navigate('/marketplace')}
        >
          Back
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>

          <div>
            {listing.thumbnail_url ? (
              <img
                src={listing.thumbnail_url}
                alt={listing.title}
                style={{ width: '100%', height: '260px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1.5rem' }}
              />
            ) : (
              <div style={{ width: '100%', height: '260px', borderRadius: '12px', background: 'var(--navy-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', marginBottom: '1.5rem' }}>
                📋
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <span className="tag">{listing.sport}</span>
              <span className="tag">{listing.category}</span>
            </div>

            <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 42px)', textTransform: 'uppercase', lineHeight: 1, marginBottom: '1rem' }}>
              {listing.title}
            </h1>

            {listing.profiles?.full_name && (
  <div
    style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', cursor: 'pointer' }}
    onClick={() => navigate('/coach/' + listing.seller_id)}
  >
    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '11px', color: 'var(--navy)', flexShrink: 0 }}>
      {listing.profiles.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
    </div>
    <div>
      <div style={{ color: 'var(--muted)', fontSize: '.75rem' }}>Posted by</div>
      <div style={{ color: 'var(--green)', fontSize: '.9rem', fontWeight: 600, textDecoration: 'underline' }}>{listing.profiles.full_name}</div>
    </div>
  </div>
)}

            <div className="section-label">About this resource</div>
            <p style={{ color: 'var(--off)', lineHeight: 1.8, fontSize: '.95rem', marginTop: '0.5rem' }}>
              {listing.description}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            <div className="cpc-card" style={{ padding: '1.75rem', position: 'sticky', top: '86px' }}>
              <div style={{ color: 'var(--green)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '2.2rem', marginBottom: '0.25rem' }}>
                {listing.price === 0 ? 'FREE' : '$' + Number(listing.price).toFixed(2)}
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '.85rem', marginBottom: '1.5rem' }}>
                {listing.price === 0 ? 'Download for free.' : 'One-time purchase. Instant access.'}
              </p>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>File</span>
                  <span style={{ color: 'var(--off)', fontSize: '.85rem' }}>{listing.file_name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Sport</span>
                  <span style={{ color: 'var(--off)', fontSize: '.85rem' }}>{listing.sport}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Category</span>
                  <span style={{ color: 'var(--off)', fontSize: '.85rem' }}>{listing.category}</span>
                </div>
              </div>

              {isOwnListing ? (
                <div style={{ background: 'var(--green-dim)', border: '1px solid var(--green-border)', borderRadius: '8px', padding: '1rem', color: 'var(--green)', fontSize: '.85rem', textAlign: 'center' }}>
                  This is your listing.
                </div>
              ) : listing.price === 0 ? (
                <button className="btn btn-green" style={{ width: '100%', justifyContent: 'center' }} onClick={handleDownload}>
                  Download Free
                </button>
              ) : !sellerReady ? (
                <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', padding: '1rem', color: '#f87171', fontSize: '.85rem', textAlign: 'center' }}>
                  Seller has not set up payments yet.
                </div>
              ) : (
                <button
                  className="btn btn-green"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={handlePurchase}
                  disabled={purchasing}
                >
                  {purchasing ? 'Redirecting...' : 'Purchase $' + Number(listing.price).toFixed(2)}
                </button>
              )}

              {error && <p className="auth-error">{error}</p>}

              <p style={{ color: 'var(--muted)', fontSize: '.75rem', textAlign: 'center', marginTop: '1rem' }}>
                {listing.price === 0 ? 'No charges.' : 'Secure checkout powered by Stripe.'}
              </p>
            </div>

            <ShareCard url={shareUrl} title={listing.title} />

          </div>
        </div>
      </div>
    </div>
  )
}