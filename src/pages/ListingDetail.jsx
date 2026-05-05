import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import StarRating from '../components/StarRating'
import ReviewForm from '../components/ReviewForm'
import MessageButton from '../components/MessageButton'
import { Helmet } from 'react-helmet-async'
import NavMessagesLink from '../components/NavMessagesLink'

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
      style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.75rem 1rem', background: 'var(--navy)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--off)', cursor: 'pointer', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '.05em', width: '100%', textAlign: 'left' }}
    >
      {copied ? 'Copied!' : 'Copy Link'}
    </button>
  )
}

function ShareCard({ url, title }) {
  const shareText = 'Check out ' + title + ' on Coaches Pay Coaches'
  const twitterUrl = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText) + '&url=' + encodeURIComponent(url) + '&hashtags=coaching,youthsports'
  return (
    <div className="cpc-card" style={{ padding: '1.25rem' }}>
      <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)', marginBottom: '1rem' }}>
        Share This Resource
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
        <a href={twitterUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.75rem 1rem', background: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', textDecoration: 'none', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>
          X - Share on X
        </a>
        <button onClick={() => { navigator.clipboard.writeText(url); alert('Link copied! Paste it in your Instagram bio, story, or DM.') }} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.75rem 1rem', background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '.05em', width: '100%', textAlign: 'left' }}>
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
  const [reviews, setReviews] = useState([])
  const [related, setRelated] = useState([])
  const [hasPurchased, setHasPurchased] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)

  useEffect(() => { fetchListing() }, [id])

  async function fetchListing() {
    const { data, error } = await supabase
      .from('listings')
      .select('*, profiles(full_name, stripe_account_id, avatar_url)')
      .eq('id', id)
      .single()
    if (!error) {
      setListing(data)
      fetchRelated(data)
    }

    const { data: reviewData } = await supabase
      .from('reviews')
      .select('*, profiles(full_name, avatar_url)')
      .eq('listing_id', id)
      .order('created_at', { ascending: false })
    setReviews(reviewData || [])

    if (user) {
      const { data: purchaseData } = await supabase
        .from('purchases')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('listing_id', id)
        .eq('status', 'completed')
        .maybeSingle()
      setHasPurchased(!!purchaseData)

      const { data: reviewCheck } = await supabase
        .from('reviews')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('listing_id', id)
        .maybeSingle()
      setHasReviewed(!!reviewCheck)
    }

    setLoading(false)
  }

  async function fetchRelated(currentListing) {
    const { data } = await supabase
      .from('listings')
      .select('*, profiles(full_name)')
      .eq('sport', currentListing.sport)
      .neq('id', currentListing.id)
      .limit(3)
    setRelated(data || [])
  }

  async function handlePurchase() {
    setPurchasing(true)
    setError(null)
    try {
      const res = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id, buyerId: profile.id, returnUrl: window.location.origin })
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
  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0
  

  return (
    <div className="page-body">
      <Helmet>
        <title>{listing.title} — Coaches Pay Coaches</title>
        <meta name="description" content={listing.description} />
        <meta property="og:title" content={listing.title} />
        <meta property="og:description" content={listing.description} />
        <meta property="og:url" content={shareUrl} />
      </Helmet>
      <nav className="cpc-nav">
        <a className="cpc-logo" onClick={() => navigate('/')}>
          <div className="logo-badge">CPC</div>
          <div className="logo-text">COACHES <em>PAY</em> COACHES</div>
        </a>
       <ul className="nav-links">
  <li><a onClick={() => navigate('/marketplace')}>Marketplace</a></li>
  <li><a onClick={() => navigate('/coaches')}>Coaches</a></li>
  {(profile?.role === 'seller' || profile?.role === 'both') && <li><a onClick={() => navigate('/seller')}>My Store</a></li>}
  {(profile?.role === 'buyer' || profile?.role === 'both') && <li><a onClick={() => navigate('/purchases')}>My Library</a></li>}
 <NavMessagesLink />
  {user ? (
    <li><a className="nav-cta" onClick={handleSignOut}>Sign Out</a></li>
  ) : (
    <li><a className="nav-cta" onClick={() => navigate('/auth')}>Get Started</a></li>
  )}
</ul>
      </nav>

      <div style={{ padding: '2.5rem 5%', maxWidth: '900px', margin: '0 auto' }}>
        <button className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '13px', marginBottom: '2rem' }} onClick={() => navigate('/marketplace')}>
          Back
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
          <div>
            {listing.thumbnail_url ? (
              <img src={listing.thumbnail_url} alt={listing.title} style={{ width: '100%', height: '260px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1.5rem' }} />
            ) : (
              <div style={{ width: '100%', height: '260px', borderRadius: '12px', background: 'var(--navy-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', marginBottom: '1.5rem' }}>📋</div>
            )}

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <span className="tag">{listing.sport}</span>
              <span className="tag">{listing.category}</span>
            </div>

            <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 42px)', textTransform: 'uppercase', lineHeight: 1, marginBottom: '1rem' }}>
              {listing.title}
            </h1>

            {reviews.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <StarRating rating={Math.round(avgRating)} />
                <span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>
                  {avgRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                </span>
              </div>
            )}

            {listing.profiles?.full_name && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', cursor: 'pointer' }} onClick={() => navigate('/coach/' + listing.seller_id)}>
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

            {/* Reviews */}
            <div style={{ marginTop: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div className="section-label" style={{ margin: 0 }}>
                  Reviews {reviews.length > 0 && '(' + reviews.length + ')'}
                </div>
                {hasPurchased && !hasReviewed && !isOwnListing && (
                  <button className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => setShowReviewForm(!showReviewForm)}>
                    {showReviewForm ? 'Cancel' : 'Write a Review'}
                  </button>
                )}
              </div>

              {showReviewForm && (
                <ReviewForm listing={listing} onSubmit={() => { setShowReviewForm(false); setHasReviewed(true); fetchListing() }} />
              )}

              {reviews.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>No reviews yet. Be the first to review this resource.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reviews.map(review => (
                    <div key={review.id} className="cpc-card" style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '10px', color: 'var(--navy)' }}>
                            {review.profiles?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
                          </div>
                          <span style={{ color: 'var(--off)', fontSize: '.9rem', fontWeight: 600 }}>{review.profiles?.full_name}</span>
                        </div>
                        <span style={{ color: 'var(--muted)', fontSize: '.78rem' }}>{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                      <StarRating rating={review.rating} size={16} />
                      {review.review && <p style={{ color: 'var(--muted)', fontSize: '.88rem', lineHeight: 1.6, marginTop: '8px' }}>{review.review}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
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
                <button className="btn btn-green" style={{ width: '100%', justifyContent: 'center' }} onClick={handlePurchase} disabled={purchasing}>
                  {purchasing ? 'Redirecting...' : 'Purchase $' + Number(listing.price).toFixed(2)}
                </button>
              )}

              {error && <p className="auth-error">{error}</p>}
{!isOwnListing && (
  <MessageButton
    sellerId={listing.seller_id}
    listingId={listing.id}
    listingTitle={listing.title}
  />
)}
              <p style={{ color: 'var(--muted)', fontSize: '.75rem', textAlign: 'center', marginTop: '1rem' }}>
                {listing.price === 0 ? 'No charges.' : 'Secure checkout powered by Stripe.'}
              </p>
            </div>

            <ShareCard url={shareUrl} title={listing.title} />
          </div>
        </div>

        {/* Related Listings */}
        {related.length > 0 && (
          <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border)', paddingTop: '2.5rem' }}>
            <div className="section-label" style={{ marginBottom: '1.5rem' }}>More {listing.sport} Resources</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {related.map(r => (
                <div key={r.id} className="cpc-card" style={{ padding: '1.25rem', cursor: 'pointer' }} onClick={() => navigate('/listing/' + r.id)}>
                  {r.thumbnail_url ? (
                    <img src={r.thumbnail_url} alt={r.title} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} />
                  ) : (
                    <div style={{ width: '100%', height: '120px', borderRadius: '8px', background: 'var(--navy-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '1rem' }}>📋</div>
                  )}
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                    <span className="tag">{r.sport}</span>
                    <span className="tag">{r.category}</span>
                  </div>
                  <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', marginBottom: '4px', lineHeight: 1.2 }}>{r.title}</div>
                  {r.profiles?.full_name && (
                    <div style={{ color: 'var(--muted)', fontSize: '.78rem', marginBottom: '8px' }}>by {r.profiles.full_name}</div>
                  )}
                  <div style={{ color: 'var(--green)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '1.1rem' }}>
                    {r.price === 0 ? 'FREE' : '$' + Number(r.price).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}