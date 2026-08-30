import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import SiteNav from '../components/SiteNav'
import ErrorState from '../components/ErrorState'

export default function Admin() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState([])
  const [listings, setListings] = useState([])
  const [purchases, setPurchases] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState({
    totalUsers: 0, totalListings: 0, totalRevenue: 0, totalSales: 0,
    totalSellers: 0, totalBuyers: 0, verifiedSellers: 0, avgOrderValue: 0
  })

  useEffect(() => {
    if (profile && !profile.is_admin) navigate('/dashboard')
    if (profile?.is_admin) fetchAll()
  }, [profile])

  async function fetchAll() {
    setFetchError(false)
    const [usersRes, listingsRes, purchasesRes, reportsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('listings').select('*, profiles(full_name)').order('created_at', { ascending: false }),
      supabase.from('purchases').select('*, listings(title, price), profiles!purchases_buyer_id_fkey(full_name)').order('created_at', { ascending: false }),
      supabase.from('reports').select('*, reporter:profiles!reports_reporter_id_fkey(full_name), reported:profiles!reports_reported_user_id_fkey(full_name)').order('created_at', { ascending: false })
    ])

    if (usersRes.error || listingsRes.error || purchasesRes.error || reportsRes.error) {
      setFetchError(true)
      setLoading(false)
      return
    }

    const usersData = usersRes.data || []
    const listingsData = listingsRes.data || []
    const purchasesData = purchasesRes.data || []
    const reportsData = reportsRes.data || []

    setUsers(usersData)
    setListings(listingsData)
    setPurchases(purchasesData)
    setReports(reportsData)

    const completed = purchasesData.filter(p => p.status === 'completed')
    const totalRevenue = completed.reduce((sum, p) => sum + Number(p.amount_platform), 0)
    const totalSales = completed.length
    const sellers = usersData.filter(u => u.role === 'seller' || u.role === 'both')
    const buyers = usersData.filter(u => u.role === 'buyer' || u.role === 'both')
    const verified = usersData.filter(u => u.verified)

    setStats({
      totalUsers: usersData.length,
      totalListings: listingsData.length,
      totalRevenue,
      totalSales,
      totalSellers: sellers.length,
      totalBuyers: buyers.length,
      verifiedSellers: verified.length,
      avgOrderValue: totalSales > 0 ? completed.reduce((sum, p) => sum + Number(p.amount_total), 0) / totalSales : 0
    })

    setLoading(false)
  }

  async function deleteListing(id) {
    if (!confirm('Delete this listing? This cannot be undone.')) return
    await supabase.from('listings').delete().eq('id', id)
    setListings(prev => prev.filter(l => l.id !== id))
  }

  async function deleteProfile(id) {
    if (!confirm('Delete this profile? This cannot be undone and will remove all their data.')) return
    await supabase.from('profiles').delete().eq('id', id)
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  async function toggleAdmin(userId, currentValue) {
    await supabase.from('profiles').update({ is_admin: !currentValue }).eq('id', userId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: !currentValue } : u))
  }

  async function toggleVerified(userId, currentValue) {
    await supabase.from('profiles').update({ verified: !currentValue }).eq('id', userId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, verified: !currentValue } : u))
  }

  async function dismissReport(reportId) {
    await supabase.from('reports').update({ status: 'dismissed' }).eq('id', reportId)
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'dismissed' } : r))
  }

  async function deleteReportedContent(report) {
    if (!confirm(`Delete this ${report.content_type} and mark the report resolved? This cannot be undone.`)) return

    const tableByType = { post: 'posts', listing: 'listings', message: 'messages' }
    const table = tableByType[report.content_type]
    if (table) {
      await supabase.from(table).delete().eq('id', report.content_id)
    }
    await supabase.from('reports').update({ status: 'resolved' }).eq('id', report.id)
    setReports(prev => prev.map(r => r.id === report.id ? { ...r, status: 'resolved' } : r))
    if (report.content_type === 'listing') setListings(prev => prev.filter(l => l.id !== report.content_id))
  }

  async function handleSignOut() {
    await signOut()
    navigate('/auth')
  }

  if (loading || !profile?.is_admin) return <div className="page-body cream-page" style={{ padding: '4rem 5%' }}><span className="muted">Loading...</span></div>
  if (fetchError) return (
    <div className="page-body">
      <SiteNav active="admin" />
      <div style={{ padding: '4rem 5%' }}>
        <ErrorState message="We couldn't load the admin dashboard right now." onRetry={fetchAll} dark />
      </div>
    </div>
  )

  const tabStyle = (tab) => ({
    padding: '8px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer',
    fontFamily: 'var(--font-body)', fontSize: '.9rem', fontWeight: 500,
    transition: 'all .2s',
    background: activeTab === tab ? 'var(--navy)' : 'transparent',
    color: activeTab === tab ? 'var(--yellow)' : 'var(--muted-on-cream)'
  })

  const completedPurchases = purchases.filter(p => p.status === 'completed')
  const pendingReports = reports.filter(r => r.status === 'pending')

  const filteredUsers = users.filter(u =>
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  )
  const filteredListings = listings.filter(l =>
    !search || l.title?.toLowerCase().includes(search.toLowerCase()) || l.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-body cream-page">
      <SiteNav active="admin" />

      <div className="dash-header">
        <div className="section-label">Admin</div>
        <h1>Admin <em>Dashboard</em></h1>
        <p>Manage users, listings, and platform revenue.</p>
      </div>

      <div className="dash-body">

        {/* Stats Row 1 */}
        <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          <div className="cpc-card" style={{ padding: '1.25rem' }}>
            <div className="muted" style={{ fontSize: '.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>Total Users</div>
            <div style={{ color: 'var(--navy)', fontFamily: 'var(--font-sub)', fontWeight: 900, fontSize: '2rem' }}>{stats.totalUsers}</div>
            <div className="muted" style={{ fontSize: '.75rem', marginTop: '4px' }}>{stats.totalSellers} sellers · {stats.totalBuyers} buyers</div>
          </div>
          <div className="cpc-card" style={{ padding: '1.25rem' }}>
            <div className="muted" style={{ fontSize: '.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>Total Listings</div>
            <div style={{ color: 'var(--navy)', fontFamily: 'var(--font-sub)', fontWeight: 900, fontSize: '2rem' }}>{stats.totalListings}</div>
            <div className="muted" style={{ fontSize: '.75rem', marginTop: '4px' }}>{listings.filter(l => l.price === 0).length} free · {listings.filter(l => l.price > 0).length} paid</div>
          </div>
          <div className="cpc-card" style={{ padding: '1.25rem' }}>
            <div className="muted" style={{ fontSize: '.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>Total Sales</div>
            <div style={{ color: 'var(--navy)', fontFamily: 'var(--font-sub)', fontWeight: 900, fontSize: '2rem' }}>{stats.totalSales}</div>
            <div className="muted" style={{ fontSize: '.75rem', marginTop: '4px' }}>avg ${stats.avgOrderValue.toFixed(2)} / order</div>
          </div>
          <div className="cpc-card" style={{ padding: '1.25rem' }}>
            <div className="muted" style={{ fontSize: '.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>Platform Revenue</div>
            <div style={{ color: 'var(--navy)', background: 'var(--yellow)', display: 'inline-block', padding: '0 8px', borderRadius: '4px', fontFamily: 'var(--font-sub)', fontWeight: 900, fontSize: '2rem' }}>${stats.totalRevenue.toFixed(2)}</div>
            <div className="muted" style={{ fontSize: '.75rem', marginTop: '4px' }}>your cut after payouts</div>
          </div>
        </div>

        {/* Stats Row 2 */}
        <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div className="cpc-card" style={{ padding: '1.25rem' }}>
            <div className="muted" style={{ fontSize: '.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>Verified Sellers</div>
            <div style={{ color: 'var(--navy)', background: 'var(--yellow)', display: 'inline-block', padding: '0 8px', borderRadius: '4px', fontFamily: 'var(--font-sub)', fontWeight: 900, fontSize: '2rem' }}>{stats.verifiedSellers}</div>
            <div className="muted" style={{ fontSize: '.75rem', marginTop: '4px' }}>of {stats.totalSellers} sellers</div>
          </div>
          <div className="cpc-card" style={{ padding: '1.25rem' }}>
            <div className="muted" style={{ fontSize: '.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>Stripe Connected</div>
            <div style={{ color: 'var(--navy)', fontFamily: 'var(--font-sub)', fontWeight: 900, fontSize: '2rem' }}>
              {users.filter(u => u.stripe_account_id).length}
            </div>
            <div className="muted" style={{ fontSize: '.75rem', marginTop: '4px' }}>sellers with Stripe</div>
          </div>
          <div className="cpc-card" style={{ padding: '1.25rem' }}>
            <div className="muted" style={{ fontSize: '.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>Listings w/ Thumbnail</div>
            <div style={{ color: 'var(--navy)', fontFamily: 'var(--font-sub)', fontWeight: 900, fontSize: '2rem' }}>
              {listings.filter(l => l.thumbnail_url).length}
            </div>
            <div className="muted" style={{ fontSize: '.75rem', marginTop: '4px' }}>of {stats.totalListings} total</div>
          </div>
          <div className="cpc-card" style={{ padding: '1.25rem' }}>
            <div className="muted" style={{ fontSize: '.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>Gross Volume</div>
            <div style={{ color: 'var(--navy)', fontFamily: 'var(--font-sub)', fontWeight: 900, fontSize: '2rem' }}>
              ${completedPurchases.reduce((sum, p) => sum + Number(p.amount_total), 0).toFixed(2)}
            </div>
            <div className="muted" style={{ fontSize: '.75rem', marginTop: '4px' }}>total buyer spend</div>
          </div>
        </div>

        {/* Search */}
        <input
          className="form-input"
          placeholder="Search users or listings..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: '1.5rem', maxWidth: '400px' }}
        />

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--cream-card)', border: '1.5px solid var(--border-on-cream)', borderRadius: '8px', padding: '4px', marginBottom: '1.5rem', width: 'fit-content' }}>
          <button onClick={() => setActiveTab('users')} style={tabStyle('users')}>Users ({filteredUsers.length})</button>
          <button onClick={() => setActiveTab('listings')} style={tabStyle('listings')}>Listings ({filteredListings.length})</button>
          <button onClick={() => setActiveTab('sales')} style={tabStyle('sales')}>Sales ({completedPurchases.length})</button>
          <button onClick={() => setActiveTab('moderation')} style={{ ...tabStyle('moderation'), position: 'relative' }}>
            Moderation ({pendingReports.length})
            {pendingReports.length > 0 && activeTab !== 'moderation' && (
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '9px', height: '9px', borderRadius: '50%', background: '#b91c1c' }} />
            )}
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {filteredUsers.map(u => (
              <div key={u.id} className="cpc-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sub)', fontWeight: 900, fontSize: '12px', color: 'var(--yellow)', flexShrink: 0 }}>
                  {u.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', color: 'var(--navy)' }}>{u.full_name}</div>
                    {u.verified && (
                      <span style={{ background: 'var(--yellow)', border: '1px solid var(--navy)', color: 'var(--navy)', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '100px', letterSpacing: '.05em' }}>✓ VERIFIED</span>
                    )}
                    {u.is_admin && (
                      <span style={{ background: 'rgba(180,120,10,0.1)', border: '1px solid rgba(180,120,10,0.4)', color: '#8a5a09', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '100px', letterSpacing: '.05em' }}>ADMIN</span>
                    )}
                  </div>
                  <div className="muted" style={{ fontSize: '.8rem' }}>
                    {u.email} · {u.role} · joined {new Date(u.created_at).toLocaleDateString()}
                    {u.stripe_account_id && <span style={{ color: '#1a7a3e', fontWeight: 600, marginLeft: '8px' }}>· Stripe connected</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button className="btn btn-ghost-dark" style={{ padding: '5px 12px', fontSize: '12px' }} onClick={() => navigate('/coach/' + u.id)}>
                    View
                  </button>
                  <button
                    className="btn"
                    style={{ padding: '5px 12px', fontSize: '12px', border: '1.5px solid', borderColor: u.verified ? 'var(--navy)' : 'var(--border-on-cream)', background: u.verified ? 'var(--yellow)' : 'transparent', color: 'var(--navy)' }}
                    onClick={() => toggleVerified(u.id, u.verified)}
                  >
                    {u.verified ? '✓ Verified' : 'Verify'}
                  </button>
                  <button
                    className="btn"
                    style={{ padding: '5px 12px', fontSize: '12px', border: '1.5px solid', borderColor: u.is_admin ? '#8a5a09' : 'var(--border-on-cream)', background: u.is_admin ? 'rgba(180,120,10,0.1)' : 'transparent', color: u.is_admin ? '#8a5a09' : 'var(--muted-on-cream)' }}
                    onClick={() => toggleAdmin(u.id, u.is_admin)}
                  >
                    {u.is_admin ? 'Remove Admin' : 'Make Admin'}
                  </button>
                  {u.id !== user.id && (
                    <button
                      className="btn"
                      style={{ padding: '5px 12px', fontSize: '12px', background: '#fff', color: '#b91c1c', border: '1.5px solid #b91c1c' }}
                      onClick={() => deleteProfile(u.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {filteredListings.map(listing => (
              <div key={listing.id} className="cpc-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                {listing.thumbnail_url ? (
                  <img src={listing.thumbnail_url} alt={listing.title} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: 'var(--cream-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>📋</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', marginBottom: '2px', color: 'var(--navy)' }}>{listing.title}</div>
                  <div className="muted" style={{ fontSize: '.8rem' }}>
                    by {listing.profiles?.full_name} · {listing.sport} · {listing.category} · {new Date(listing.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ color: listing.price === 0 ? 'var(--muted-on-cream)' : 'var(--navy)', background: listing.price === 0 ? 'transparent' : 'var(--yellow)', padding: listing.price === 0 ? '0' : '1px 8px', borderRadius: '4px', fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: '1.1rem' }}>
                    {listing.price === 0 ? 'FREE' : '$' + Number(listing.price).toFixed(2)}
                  </div>
                  {!listing.thumbnail_url && (
                    <span style={{ fontSize: '10px', color: '#8a5a09', border: '1px solid rgba(180,120,10,0.35)', padding: '2px 8px', borderRadius: '100px' }}>No Thumbnail</span>
                  )}
                  <button className="btn btn-ghost-dark" style={{ padding: '5px 12px', fontSize: '12px' }} onClick={() => navigate('/listing/' + listing.id)}>View</button>
                  <button
                    className="btn"
                    style={{ padding: '5px 12px', fontSize: '12px', background: '#fff', color: '#b91c1c', border: '1.5px solid #b91c1c' }}
                    onClick={() => deleteListing(listing.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sales Tab */}
        {activeTab === 'sales' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {completedPurchases.length === 0 ? (
              <div className="cpc-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                <p className="muted">No completed sales yet.</p>
              </div>
            ) : completedPurchases.map(purchase => (
              <div key={purchase.id} className="cpc-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', marginBottom: '2px', color: 'var(--navy)' }}>{purchase.listings?.title}</div>
                  <div className="muted" style={{ fontSize: '.8rem' }}>
                    Buyer: {purchase.profiles?.full_name} · {new Date(purchase.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--navy)', fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: '1.1rem' }}>${Number(purchase.amount_total).toFixed(2)}</div>
                    <div className="muted" style={{ fontSize: '.75rem' }}>total</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--navy)', background: 'var(--yellow)', padding: '1px 8px', borderRadius: '4px', fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: '1.1rem' }}>${Number(purchase.amount_platform).toFixed(2)}</div>
                    <div className="muted" style={{ fontSize: '.75rem' }}>your cut</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="muted" style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: '1.1rem' }}>${Number(purchase.amount_seller).toFixed(2)}</div>
                    <div className="muted" style={{ fontSize: '.75rem' }}>seller payout</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Moderation Tab */}
        {activeTab === 'moderation' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {reports.length === 0 ? (
              <div className="cpc-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                <p className="muted">No reports filed yet.</p>
              </div>
            ) : (
              [...pendingReports, ...reports.filter(r => r.status !== 'pending')].map(report => (
                <div key={report.id} className="cpc-card" style={{ padding: '1.25rem', opacity: report.status === 'pending' ? 1 : 0.55 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="tag" style={{ textTransform: 'uppercase' }}>{report.content_type}</span>
                      <span style={{
                        fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '100px', textTransform: 'uppercase',
                        background: report.status === 'pending' ? 'rgba(180,120,10,0.1)' : report.status === 'resolved' ? 'rgba(26,122,62,0.1)' : 'var(--cream-card)',
                        color: report.status === 'pending' ? '#8a5a09' : report.status === 'resolved' ? '#1a7a3e' : 'var(--muted-on-cream)',
                        border: report.status === 'pending' ? '1px solid rgba(180,120,10,0.35)' : report.status === 'resolved' ? '1px solid rgba(26,122,62,0.3)' : '1px solid var(--border-on-cream)'
                      }}>
                        {report.status}
                      </span>
                    </div>
                    <span className="muted" style={{ fontSize: '.78rem' }}>{new Date(report.created_at).toLocaleDateString()}</span>
                  </div>

                  <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: '.85rem', color: 'var(--navy)', marginBottom: '4px' }}>
                    Reason: {report.reason || '—'}
                  </div>
                  {report.content_snapshot && (
                    <div style={{ background: 'var(--cream-card)', border: '1px solid var(--border-on-cream)', borderRadius: '8px', padding: '10px 14px', margin: '8px 0', color: 'var(--navy)', fontSize: '.85rem', lineHeight: 1.5 }}>
                      "{report.content_snapshot}"
                    </div>
                  )}
                  <div className="muted" style={{ fontSize: '.78rem', marginBottom: report.status === 'pending' ? '12px' : 0 }}>
                    Reported by {report.reporter?.full_name || 'Unknown'}
                    {report.reported?.full_name && <> · About {report.reported.full_name}</>}
                  </div>

                  {report.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn"
                        style={{ padding: '6px 14px', fontSize: '12px', background: '#fff', color: '#b91c1c', border: '1.5px solid #b91c1c' }}
                        onClick={() => deleteReportedContent(report)}
                      >
                        Delete Content
                      </button>
                      <button className="btn btn-ghost-dark" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={() => dismissReport(report.id)}>
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}