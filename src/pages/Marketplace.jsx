import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const SPORTS = ['All', 'Basketball', 'Soccer', 'Football', 'Baseball', 'Hockey', 'Volleyball', 'Lacrosse', 'Tennis', 'Track & Field', 'Swimming', 'Multi-Sport', 'Other']
const CATEGORIES = ['All', 'Practice Plans', 'Drills', 'Playbooks', 'Season Plans', 'Scouting Reports', 'Strength & Conditioning', 'Film Breakdown', 'Recruiting', 'Mental Performance', 'Other']

export default function Marketplace() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [sport, setSport] = useState('All')
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')

  useEffect(() => { fetchListings() }, [])
  useEffect(() => { applyFilters() }, [listings, sport, category, search, sort])

  async function fetchListings() {
  const { data, error } = await supabase
    .from('listings')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false })
  if (!error) {
    console.log('listings data:', data)
    setListings(data)
  }
  setLoading(false)
}

  function applyFilters() {
    let result = [...listings]
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

  async function handleSignOut() {
    await signOut()
    navigate('/auth')
  }

  return (
    <div className="page-body">
      <nav className="cpc-nav">
        <a className="cpc-logo" onClick={() => navigate('/')}>
          <div className="logo-badge">CPC</div>
          <div className="logo-text">COACHES <em>PAY</em> COACHES</div>
        </a>
        <ul className="nav-links">
          <li><a onClick={() => navigate('/dashboard')}>Dashboard</a></li>
          {profile?.role === 'seller' && <li><a onClick={() => navigate('/seller')}>My Store</a></li>}
          {profile?.role === 'buyer' && <li><a onClick={() => navigate('/purchases')}>My Library</a></li>}
          <li><a className="nav-cta" onClick={handleSignOut}>Sign Out</a></li>
        </ul>
      </nav>

      {/* Hero */}
      <div style={{ background: 'var(--navy-mid)', borderBottom: '1px solid var(--border)', padding: '3rem 5% 2rem' }}>
        <div className="section-label">Marketplace</div>
        <h1 className="section-title">Browse <em>Resources</em></h1>
        <p style={{ color: 'var(--muted)', maxWidth: '520px', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Coaching materials from real coaches across every sport — practice plans, drills, playbooks, and more.
        </p>
        <div style={{ position: 'relative', maxWidth: '480px' }}>
          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>🔍</span>
          <input
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search resources..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={{ padding: '2rem 5%' }}>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ flex: 1, minWidth: '160px' }}>
            <label className="form-label">Sport</label>
            <select className="form-input" value={sport} onChange={e => setSport(e.target.value)}>
              {SPORTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '160px' }}>
            <label className="form-label">Category</label>
            <select className="form-input" value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '160px' }}>
            <label className="form-label">Sort By</label>
            <select className="form-input" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
          <div style={{ alignSelf: 'flex-end', color: 'var(--muted)', fontSize: '.85rem', paddingBottom: '0.1rem' }}>
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
                padding: '6px 14px',
                borderRadius: '100px',
                border: '1px solid',
                borderColor: sport === s ? 'var(--green)' : 'var(--border)',
                background: sport === s ? 'var(--green-dim)' : 'transparent',
                color: sport === s ? 'var(--green)' : 'var(--muted)',
                fontSize: '.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all .2s',
                fontFamily: 'Barlow Condensed, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '.05em'
              }}
            >{s}</button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="cpc-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>No resources found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="dash-grid">
            {filtered.map(listing => (
              <ListingCard key={listing.id} listing={listing} navigate={navigate} />
            ))}
          </div>
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
        <div style={{ width: '100%', height: '140px', borderRadius: '8px', background: 'var(--navy-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', fontSize: '2.5rem' }}>📋</div>
      )}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
          <span className="tag">{listing.sport}</span>
          <span className="tag">{listing.category}</span>
        </div>
        <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '1.05rem', textTransform: 'uppercase', marginBottom: '6px', lineHeight: 1.2 }}>
          {listing.title}
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '.85rem', lineHeight: 1.6, marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {listing.description}
        </p>
        {listing.profiles?.full_name && (
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', cursor: 'pointer' }}
            onClick={(e) => { e.stopPropagation(); navigate('/coach/' + listing.seller_id) }}
          >
            <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '9px', color: 'var(--navy)', flexShrink: 0 }}>
              {listing.profiles.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <span style={{ color: 'var(--green)', fontSize: '.8rem', fontWeight: 600, textDecoration: 'underline' }}>
              {listing.profiles.full_name}
            </span>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ color: 'var(--green)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '1.25rem' }}>
          {listing.price === 0 ? 'FREE' : '$' + Number(listing.price).toFixed(2)}
        </div>
        <button className="btn btn-green" style={{ padding: '8px 18px', fontSize: '13px' }} onClick={() => navigate('/listing/' + listing.id)}>
          View
        </button>
      </div>
    </div>
  )
}
