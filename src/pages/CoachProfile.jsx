import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import StarRating from '../components/StarRating'
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
        padding: '.65rem 1rem', background: 'var(--navy)',
        border: '1px solid var(--border)', borderRadius: '8px',
        color: 'var(--off)', cursor: 'pointer',
        fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
        fontSize: '.8rem', textTransform: 'uppercase',
        letterSpacing: '.05em', width: '100%', textAlign: 'left'
      }}
    >
      {copied ? 'Copied!' : 'Copy Link'}
    </button>
  )
}

function ShareCard({ url, name }) {
  const shareText = 'Check out ' + name + ' on Coaches Pay Coaches'
  const twitterUrl = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText) + '&url=' + encodeURIComponent(url) + '&hashtags=coaching,youthsports'

  return (
    <div className="cpc-card" style={{ padding: '1rem' }}>
      <div style={{
        fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
        fontSize: '.75rem', textTransform: 'uppercase',
        letterSpacing: '.05em', color: 'var(--muted)', marginBottom: '.75rem'
      }}>
        Share Profile
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: '.75rem',
            padding: '.65rem 1rem', background: '#000',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
            color: '#fff', textDecoration: 'none',
            fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
            fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '.05em'
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
            padding: '.65rem 1rem',
            background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
            border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer',
            fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
            fontSize: '.8rem', textTransform: 'uppercase',
            letterSpacing: '.05em', width: '100%', textAlign: 'left'
          }}
        >
          Copy for Instagram
        </button>
        <CopyLinkButton url={url} />
      </div>
    </div>
  )
}

export default function CoachProfile() {
  const { id } = useParams()
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [coach, setCoach] = useState(null)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchCoach() }, [id])

  async function fetchCoach() {
    const { data: coachData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    if (error || !coachData) { setLoading(false); return }
    setCoach(coachData)
    const { data: listingsData } = await supabase
      .from('listings')
      .select('*')
      .eq('seller_id', id)
      .order('created_at', { ascending: false })
    setListings(listingsData || [])
    setLoading(false)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/auth')
  }

  if (loading) return <div className="page-body" style={{ padding: '4rem 5%', color: 'var(--muted)' }}>Loading...</div>
  if (!coach) return <div className="page-body" style={{ padding: '4rem 5%', color: 'var(--muted)' }}>Coach not found.</div>

  const initials = coach.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'
  const avgPrice = listings.length > 0 ? listings.reduce((sum, l) => sum + Number(l.price), 0) / listings.length : 0
  const sports = [...new Set(listings.map(l => l.sport))]
  const shareUrl = 'https://coachespaycoaches.org/coach/' + coach.id

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

      <div style={{ background: 'var(--navy-mid)', borderBottom: '1px solid var(--border)', padding: '3rem 5%' }}>
        <button
          className="btn btn-ghost"
          style={{ padding: '8px 16px', fontSize: '13px', marginBottom: '2rem' }}
          onClick={() => navigate(-1)}
        >
          Back
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '20px', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '32px', color: 'var(--navy)', flexShrink: 0 }}>
            {initials}
          </div>

          <div style={{ flex: 1 }}>
            <div className="section-label" style={{ marginBottom: '8px' }}>Coach Profile</div>
            <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 48px)', textTransform: 'uppercase', lineHeight: 1, marginBottom: '12px' }}>
              {coach.full_name}
            </h1>
            {sports.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {sports.map(s => <span key={s} className="tag">{s}</span>)}
              </div>
            )}
            {coach.bio && (
              <p style={{ color: 'var(--muted)', fontSize: '.95rem', lineHeight: 1.7, maxWidth: '600px' }}>
                {coach.bio}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="cpc-card" style={{ padding: '1.25rem', textAlign: 'center', minWidth: '110px' }}>
                <div style={{ color: 'var(--green)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '2rem', lineHeight: 1 }}>
                  {listings.length}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '.75rem', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '.05em' }}>Resources</div>
              </div>
              <div className="cpc-card" style={{ padding: '1.25rem', textAlign: 'center', minWidth: '110px' }}>
                <div style={{ color: 'var(--white)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '2rem', lineHeight: 1 }}>
                  {avgPrice === 0 ? 'FREE' : '$' + avgPrice.toFixed(0)}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '.75rem', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '.05em' }}>Avg Price</div>
              </div>
            </div>

            <ShareCard url={shareUrl} name={coach.full_name} />
          </div>
        </div>
      </div>

      <div className="dash-body">
        <div className="section-label" style={{ marginBottom: '1.5rem' }}>
          Resources by {coach.full_name?.split(' ')[0]}
        </div>
        {listings.length === 0 ? (
          <div className="cpc-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--muted)' }}>This coach has not uploaded any resources yet.</p>
          </div>
        ) : (
          <div className="dash-grid">
            {listings.map(listing => (
              <div key={listing.id} className="cpc-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                {listing.thumbnail_url ? (
                  <img
                    src={listing.thumbnail_url}
                    alt={listing.title}
                    style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '140px', borderRadius: '8px', background: 'var(--navy-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', marginBottom: '1rem' }}>
                    📋
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <span className="tag">{listing.sport}</span>
                    <span className="tag">{listing.category}</span>
                  </div>
                  <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '1.05rem', textTransform: 'uppercase', marginBottom: '6px', lineHeight: 1.2 }}>
                    {listing.title}
                  </div>
                  <p style={{ color: 'var(--muted)', fontSize: '.85rem', lineHeight: 1.6, marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {listing.description}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <div style={{ color: 'var(--green)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '1.25rem' }}>
                    {listing.price === 0 ? 'FREE' : '$' + Number(listing.price).toFixed(2)}
                  </div>
                  <button
                    className="btn btn-green"
                    style={{ padding: '8px 18px', fontSize: '13px' }}
                    onClick={() => navigate('/listing/' + listing.id)}
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}function CoachReviews({ sellerId }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReviews() {
      const { data } = await supabase
        .from('reviews')
        .select('*, profiles(full_name), listings(title)')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false })
      setReviews(data || [])
      setLoading(false)
    }
    fetchReviews()
  }, [sellerId])

  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

  if (loading) return null

  return (
    <div className="dash-body" style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="section-label" style={{ margin: 0 }}>Reviews ({reviews.length})</div>
        {reviews.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <StarRating rating={Math.round(avgRating)} size={16} />
            <span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>{avgRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>No reviews yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.map(review => (
            <div key={review.id} className="cpc-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '10px', color: 'var(--navy)' }}>
                    {review.profiles?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
                  </div>
                  <div>
                    <span style={{ color: 'var(--off)', fontSize: '.9rem', fontWeight: 600 }}>{review.profiles?.full_name}</span>
                    {review.listings?.title && (
                      <div style={{ color: 'var(--muted)', fontSize: '.75rem' }}>on {review.listings.title}</div>
                    )}
                  </div>
                </div>
                <span style={{ color: 'var(--muted)', fontSize: '.78rem' }}>{new Date(review.created_at).toLocaleDateString()}</span>
              </div>
              <StarRating rating={review.rating} size={16} />
              {review.review && (
                <p style={{ color: 'var(--muted)', fontSize: '.88rem', lineHeight: 1.6, marginTop: '8px' }}>{review.review}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}