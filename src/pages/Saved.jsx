import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Helmet } from 'react-helmet-async'
import SiteNav from '../components/SiteNav'
import ErrorState from '../components/ErrorState'

export default function Saved() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [saved, setSaved] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [removingId, setRemovingId] = useState(null)

  useEffect(() => { fetchSaved() }, [])

  async function fetchSaved() {
    setFetchError(false)
    setLoading(true)
    const { data, error } = await supabase
      .from('saved_listings')
      .select('id, listing_id, listings(id, title, sport, category, price, thumbnail_url, seller_id, profiles(full_name))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) { setFetchError(true); setLoading(false); return }
    setSaved((data || []).filter(s => s.listings))
    setLoading(false)
  }

  async function handleRemove(savedId) {
    setRemovingId(savedId)
    await supabase.from('saved_listings').delete().eq('id', savedId)
    setSaved(prev => prev.filter(s => s.id !== savedId))
    setRemovingId(null)
  }

  return (
    <div className="page-body cream-page">
      <Helmet>
        <title>Saved — Coaches Pay Coaches</title>
      </Helmet>
      <SiteNav active="saved" />

      <div className="dash-header">
        <div className="section-label">My Library</div>
        <h1>Your <em>Saved</em> Resources</h1>
        <p>Listings you've bookmarked to come back to later.</p>
      </div>

      <div className="dash-body">
        {loading ? (
          <p className="muted">Loading...</p>
        ) : fetchError ? (
          <ErrorState message="We couldn't load your saved listings right now." onRetry={fetchSaved} />
        ) : saved.length === 0 ? (
          <div className="cpc-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔖</div>
            <p className="muted" style={{ marginBottom: '1.5rem', fontSize: '1.05rem' }}>You haven't saved anything yet.</p>
            <button className="btn btn-green" onClick={() => navigate('/marketplace')}>Browse the Marketplace →</button>
          </div>
        ) : (
          <div className="dash-grid">
            {saved.map(item => {
              const listing = item.listings
              return (
                <div key={item.id} className="cpc-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                  {listing.thumbnail_url ? (
                    <img src={listing.thumbnail_url} alt={listing.title} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem', cursor: 'pointer' }} onClick={() => navigate('/listing/' + listing.id)} />
                  ) : (
                    <div style={{ width: '100%', height: '140px', borderRadius: '8px', background: 'var(--cream-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', fontSize: '2.5rem', cursor: 'pointer' }} onClick={() => navigate('/listing/' + listing.id)}>📋</div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <span className="tag">{listing.sport}</span>
                      <span className="tag">{listing.category}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: '1.05rem', textTransform: 'uppercase', marginBottom: '4px', lineHeight: 1.2, color: 'var(--navy)', cursor: 'pointer' }} onClick={() => navigate('/listing/' + listing.id)}>
                      {listing.title}
                    </div>
                    {listing.profiles?.full_name && (
                      <div className="muted" style={{ fontSize: '.8rem', marginBottom: '10px' }}>by {listing.profiles.full_name}</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-on-cream)' }}>
                    <div style={{ color: 'var(--navy)', background: 'var(--yellow)', padding: '2px 10px', borderRadius: '5px', fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: '1.1rem' }}>
                      {listing.price === 0 ? 'FREE' : '$' + Number(listing.price).toFixed(2)}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-ghost-dark" style={{ padding: '8px 14px', fontSize: '13px' }} onClick={() => handleRemove(item.id)} disabled={removingId === item.id}>
                        {removingId === item.id ? '...' : 'Remove'}
                      </button>
                      <button className="btn btn-green" style={{ padding: '8px 18px', fontSize: '13px' }} onClick={() => navigate('/listing/' + listing.id)}>
                        View
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
