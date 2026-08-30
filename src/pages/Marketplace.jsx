import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Helmet } from 'react-helmet-async'
import SiteNav from '../components/SiteNav'

const SPORTS = ['All', 'Basketball', 'Soccer', 'Football', 'Baseball', 'Softball', 'Hockey', 'Volleyball', 'Lacrosse', 'Tennis', 'Track & Field', 'Swimming', 'Wrestling', 'Golf', 'Gymnastics', 'Cheerleading', 'Dance', 'Cross Country', 'Rugby', 'Field Hockey', 'Water Polo', 'Bowling', 'Cycling', 'Rowing', 'Fencing', 'Skiing', 'Snowboarding', 'Martial Arts', 'Boxing', 'Multi-Sport', 'Other']
const CATEGORIES = ['All', 'Practice Plans', 'Drills & Workouts', 'Playbooks', 'Season Plans', 'Scouting Reports', 'Film Breakdown', 'Nutrition Plans', 'Meal Prep Guides', 'Mental Performance', 'Injury Prevention', 'Recovery Protocols', 'Speed & Agility Programs', 'Strength Programs', 'Recruiting Guides', 'Academic Resources', 'Parent Resources', 'Leadership Development', 'Other']
export default function Marketplace() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [sport, setSport] = useState('All')
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [showFollowing, setShowFollowing] = useState(false)
  const [followingIds, setFollowingIds] = useState([])
  const [visibleCount, setVisibleCount] = useState(24)

  useEffect(() => { fetchListings() }, [])
  useEffect(() => { applyFilters(); setVisibleCount(24) }, [listings, sport, category, search, sort, showFollowing, followingIds])

 async function fetchListings() {
  const { data: listingsData, error } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false })

  if (error || !listingsData) { setLoading(false); return }

  const sellerIds = [...new Set(listingsData.map(l => l.seller_id))]
  const listingIds = listingsData.map(l => l.id)

  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', sellerIds)

  const { data: reviewsData } = await supabase
    .from('reviews')
    .select('listing_id, rating')
    .in('listing_id', listingIds)

  const profileMap = {}
  profilesData?.forEach(p => { profileMap[p.id] = p })

  const reviewMap = {}
  reviewsData?.forEach(r => {
    if (!reviewMap[r.listing_id]) reviewMap[r.listing_id] = []
    reviewMap[r.listing_id].push(r.rating)
  })

  const combined = listingsData.map(l => {
    const ratings = reviewMap[l.id] || []
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
    return {
      ...l,
      profiles: profileMap[l.seller_id] || null,
      avgRating,
      reviewCount: ratings.length
    }
  })

  setListings(combined)

  if (user) {
    const { data: followingData } = await supabase
      .from('followers')
      .select('following_id')
      .eq('follower_id', user.id)
    setFollowingIds((followingData || []).map(f => f.following_id))
  }

  setLoading(false)
}

  function applyFilters() {
    let result = [...listings]
    if (showFollowing && followingIds.length > 0) result = result.filter(l => followingIds.includes(l.seller_id))
    if (sport !== 'All') result = result.filter(l => l.sport === sport)
    if (category !== 'All') result = result.filter(l => l.category === category)
    if (search) result = result.filter(l =>
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.description.toLowerCase().includes(search.toLowerCase())
    )
    if (sort === 'newest') result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    if (sort === 'oldest') result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    if (sort === 'price-low') result.sort((a, b) => a.price - b.price)
    if (sort === 'price-high') result.sort((a, b) => b.price - a.price)
    setFiltered(result)
  }

  return (
    <div className="page-body cream-page">
      <Helmet>
  <title>Browse Resources — Coaches Pay Coaches</title>
  <meta name="description" content="Browse coaching materials from real coaches — practice plans, drills, playbooks, season plans and more across every sport." />
  <meta property="og:title" content="Browse Resources — Coaches Pay Coaches" />
  <meta property="og:url" content="https://coachespaycoaches.org/marketplace" />
</Helmet>
      <SiteNav active="marketplace" />

      <div style={{ background: 'var(--navy)', padding: '3rem 5% 2.5rem' }}>
        <div className="section-label" style={{ color: 'var(--yellow)' }}>Marketplace</div>
        <h1 className="section-title" style={{ color: 'var(--white)' }}>Browse <em>Resources</em></h1>
        <p style={{ color: 'var(--off)', opacity: .85, maxWidth: '520px', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Coaching materials from real coaches across every sport.
        </p>
        <div style={{ position: 'relative', maxWidth: '480px' }}>
          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>🔍</span>
          <input
            className="form-input"
            style={{ paddingLeft: '2.5rem', background: 'var(--navy-light)', borderColor: 'var(--border)', color: 'var(--white)' }}
            placeholder="Search resources..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={{ padding: '2rem 5%' }}>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, minWidth: '140px' }}>
            <label className="form-label">Sport</label>
            <select className="form-input" value={sport} onChange={e => setSport(e.target.value)}>
              {SPORTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '140px' }}>
            <label className="form-label">Category</label>
            <select className="form-input" value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '140px' }}>
            <label className="form-label">Sort By</label>
            <select className="form-input" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
          {user && (
            <button
              onClick={() => setShowFollowing(!showFollowing)}
              style={{
                padding: '10px 18px', borderRadius: '8px', border: '1.5px solid',
                borderColor: showFollowing ? 'var(--navy)' : 'var(--border-on-cream)',
                background: showFollowing ? 'var(--yellow)' : 'transparent',
                color: 'var(--navy)',
                fontSize: '.85rem', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font-sub)', textTransform: 'uppercase',
                letterSpacing: '.05em', transition: 'all .2s', whiteSpace: 'nowrap'
              }}
            >
              {showFollowing ? '✓ Following' : 'Following'}
            </button>
          )}
          <div className="muted" style={{ fontSize: '.85rem', paddingBottom: '0.1rem' }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Sport pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {SPORTS.map(s => (
            <button
              key={s}
              onClick={() => setSport(s)}
              style={{
                padding: '6px 14px', borderRadius: '100px', border: '1.5px solid',
                borderColor: sport === s ? 'var(--navy)' : 'var(--border-on-cream)',
                background: sport === s ? 'var(--yellow)' : 'transparent',
                color: 'var(--navy)',
                fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all .2s',
                fontFamily: 'var(--font-sub)', textTransform: 'uppercase', letterSpacing: '.05em'
              }}
            >{s}</button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <p className="muted">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="cpc-card" style={{ padding: '3rem', textAlign: 'center' }}>
            {showFollowing ? (
              <>
                <p className="muted" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                  No listings from coaches you follow yet.
                </p>
                <button className="btn btn-green" onClick={() => navigate('/coaches')}>
                  Discover Coaches →
                </button>
              </>
            ) : (
              <p className="muted" style={{ fontSize: '1.1rem' }}>No resources found. Try adjusting your filters.</p>
            )}
          </div>
        ) : (
          <>
            <div className="dash-grid">
              {filtered.slice(0, visibleCount).map(listing => (
                <ListingCard key={listing.id} listing={listing} navigate={navigate} />
              ))}
            </div>
            {filtered.length > visibleCount && (
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button className="btn btn-ghost-dark" onClick={() => setVisibleCount(c => c + 24)}>
                  Load More ({filtered.length - visibleCount} more)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function ListingCard({ listing, navigate }) {
  return (
    <div className="cpc-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
      {listing.thumbnail_url ? (
        <img src={listing.thumbnail_url} alt={listing.title} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} />
      ) : (
        <div style={{ width: '100%', height: '140px', borderRadius: '8px', background: 'var(--cream-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', fontSize: '2.5rem' }}>📋</div>
      )}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
          <span className="tag">{listing.sport}</span>
          <span className="tag">{listing.category}</span>
        </div>
        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: '1.05rem', textTransform: 'uppercase', marginBottom: '6px', lineHeight: 1.2, color: 'var(--navy)' }}>
          {listing.title}
        </div>
        <p className="muted" style={{ fontSize: '.85rem', lineHeight: 1.6, marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {listing.description}
        </p>
        {listing.reviewCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', gap: '1px' }}>
              {[1,2,3,4,5].map(star => (
                <span key={star} style={{ fontSize: '13px', color: star <= Math.round(listing.avgRating) ? '#c8860a' : 'var(--border-on-cream)' }}>★</span>
              ))}
            </div>
            <span className="muted" style={{ fontSize: '.75rem' }}>
              {listing.avgRating.toFixed(1)} ({listing.reviewCount})
            </span>
          </div>
        )}
        {listing.profiles?.full_name && (
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', cursor: 'pointer' }}
            onClick={(e) => { e.stopPropagation(); navigate('/coach/' + listing.seller_id) }}
          >
            <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sub)', fontWeight: 900, fontSize: '9px', color: 'var(--yellow)', flexShrink: 0 }}>
              {listing.profiles.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <span style={{ color: 'var(--navy)', fontSize: '.8rem', fontWeight: 700, textDecoration: 'underline' }}>
              {listing.profiles.full_name}
            </span>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-on-cream)' }}>
        <div style={{ color: 'var(--navy)', background: 'var(--yellow)', padding: '2px 10px', borderRadius: '5px', fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: '1.1rem' }}>
          {listing.price === 0 ? 'FREE' : '$' + Number(listing.price).toFixed(2)}
        </div>
        <button className="btn btn-green" style={{ padding: '8px 18px', fontSize: '13px' }} onClick={() => navigate('/listing/' + listing.id)}>
          View
        </button>
      </div>
    </div>
  )
}
