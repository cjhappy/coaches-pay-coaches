import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import NavMessagesLink from '../components/NavMessagesLink'

export default function Purchases() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState(null)
  const [error, setError] = useState(null)
  const justPurchased = searchParams.get('success') === 'true'

  useEffect(() => { fetchPurchases() }, [])

  async function fetchPurchases() {
    const { data, error } = await supabase
      .from('purchases')
      .select('*, listings(id, title, sport, category, file_url, file_name, thumbnail_url, price)')
      .eq('buyer_id', profile.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
    if (!error) setPurchases(data)
    setLoading(false)
  }

  // Use live listing data if available, fall back to snapshot
  function getTitle(purchase) { return purchase.listings?.title || purchase.listing_title || 'Deleted Resource' }
  function getSport(purchase) { return purchase.listings?.sport || purchase.listing_sport || null }
  function getCategory(purchase) { return purchase.listings?.category || purchase.listing_category || null }
  function getThumbnail(purchase) { return purchase.listings?.thumbnail_url || purchase.listing_thumbnail_url || null }
  function getFileName(purchase) { return purchase.listings?.file_name || purchase.listing_file_name || null }
  function getFileUrl(purchase) { return purchase.listings?.file_url || purchase.listing_file_url || null }

  async function handleDownload(purchase) {
    const fileUrl = getFileUrl(purchase)
    if (!fileUrl) { setError('File is no longer available.'); return }
    setDownloadingId(purchase.id)
    setError(null)
    const { data, error } = await supabase.storage
      .from('listings-files')
      .createSignedUrl(fileUrl, 60)
    if (error) {
      setError('Could not generate download link.')
    } else {
      window.open(data.signedUrl, '_blank')
    }
    setDownloadingId(null)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/auth')
  }

  return (
    <div className="page-body">
      <nav className="cpc-nav">
        <a className="cpc-logo">
          <div className="logo-badge">CPC</div>
          <div className="logo-text">COACHES <em>PAY</em> COACHES</div>
        </a>
        <ul className="nav-links">
          <li><a onClick={() => navigate('/feed')}>Feed</a></li>
          <li><a onClick={() => navigate('/dashboard')}>Dashboard</a></li>
          <li><a onClick={() => navigate('/marketplace')}>Marketplace</a></li>
          <li><a onClick={() => navigate('/coaches')}>Coaches</a></li>
          <NavMessagesLink />
          <li><a className="nav-cta" onClick={handleSignOut}>Sign Out</a></li>
        </ul>
      </nav>

      <div className="dash-header">
        <div className="section-label">My Library</div>
        <h1>Your <em>Purchases</em></h1>
        <p style={{ color: 'var(--muted)' }}>All your purchased coaching materials in one place.</p>
      </div>

      <div className="dash-body">
        {justPurchased && (
          <div style={{ background: 'var(--green-dim)', border: '1px solid var(--green-border)', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.5rem', color: 'var(--green)', fontSize: '.9rem' }}>
            ✅ Purchase successful! Your resource is ready to download below.
          </div>
        )}

        {error && <p className="auth-error" style={{ marginBottom: '1rem' }}>{error}</p>}

        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading...</p>
        ) : purchases.length === 0 ? (
          <div className="cpc-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <p style={{ color: 'var(--muted)', marginBottom: '1.5rem', fontSize: '1.05rem' }}>You haven't purchased anything yet.</p>
            <button className="btn btn-green" onClick={() => navigate('/marketplace')}>Browse the Marketplace →</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {purchases.map(purchase => (
              <div key={purchase.id} className="cpc-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>

                {getThumbnail(purchase) ? (
                  <img src={getThumbnail(purchase)} alt={getTitle(purchase)} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '80px', height: '80px', borderRadius: '8px', background: 'var(--navy-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>📋</div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '1.05rem', textTransform: 'uppercase' }}>
                      {getTitle(purchase)}
                    </div>
                    {!purchase.listings && (
                      <span style={{ fontSize: '10px', color: 'var(--muted)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: '100px' }}>Removed</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    {getSport(purchase) && <span className="tag">{getSport(purchase)}</span>}
                    {getCategory(purchase) && <span className="tag">{getCategory(purchase)}</span>}
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '.8rem' }}>
                    {getFileName(purchase) && `${getFileName(purchase)} · `}Purchased {new Date(purchase.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                  <div style={{ color: 'var(--green)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '1.1rem' }}>
                    {purchase.amount_total === 0 ? 'FREE' : `$${Number(purchase.amount_total).toFixed(2)}`}
                  </div>
                  <button
                    className="btn btn-green"
                    style={{ padding: '8px 18px', fontSize: '13px' }}
                    onClick={() => handleDownload(purchase)}
                    disabled={downloadingId === purchase.id || !getFileUrl(purchase)}
                  >
                    {downloadingId === purchase.id ? 'Generating...' : 'Download →'}
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}