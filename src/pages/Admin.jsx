import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Admin() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState([])
  const [listings, setListings] = useState([])
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalUsers: 0, totalListings: 0, totalRevenue: 0, totalSales: 0 })

  useEffect(() => {
    if (profile && !profile.is_admin) navigate('/dashboard')
    if (profile?.is_admin) fetchAll()
  }, [profile])

  async function fetchAll() {
    const [usersRes, listingsRes, purchasesRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('listings').select('*, profiles(full_name)').order('created_at', { ascending: false }),
      supabase.from('purchases').select('*, listings(title), profiles!purchases_buyer_id_fkey(full_name)').order('created_at', { ascending: false })
    ])

    const usersData = usersRes.data || []
    const listingsData = listingsRes.data || []
    const purchasesData = purchasesRes.data || []

    setUsers(usersData)
    setListings(listingsData)
    setPurchases(purchasesData)

    const totalRevenue = purchasesData
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + Number(p.amount_platform), 0)

    setStats({
      totalUsers: usersData.length,
      totalListings: listingsData.length,
      totalRevenue,
      totalSales: purchasesData.filter(p => p.status === 'completed').length
    })

    setLoading(false)
  }

  async function deleteListing(id) {
    if (!confirm('Delete this listing?')) return
    await supabase.from('listings').delete().eq('id', id)
    setListings(prev => prev.filter(l => l.id !== id))
  }

  async function toggleAdmin(userId, currentValue) {
    await supabase.from('profiles').update({ is_admin: !currentValue }).eq('id', userId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: !currentValue } : u))
  }

  async function handleSignOut() {
    await signOut()
    navigate('/auth')
  }

  if (loading || !profile?.is_admin) return <div className="page-body" style={{ padding: '4rem 5%', color: 'var(--muted)' }}>Loading...</div>

  const tabStyle = (tab) => ({
    padding: '8px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer',
    fontFamily: 'Barlow, sans-serif', fontSize: '.9rem', fontWeight: 500,
    transition: 'all .2s',
    background: activeTab === tab ? 'var(--green)' : 'transparent',
    color: activeTab === tab ? 'var(--navy)' : 'var(--muted)'
  })

  return (
    <div className="page-body">
      <nav className="cpc-nav">
        <a className="cpc-logo" onClick={() => navigate('/')}>
          <div className="logo-badge">CPC</div>
          <div className="logo-text">COACHES <em>PAY</em> COACHES</div>
        </a>
        <ul className="nav-links">
          <li><a onClick={() => navigate('/feed')}>Feed</a></li>
          <li><a onClick={() => navigate('/dashboard')}>Dashboard</a></li>
          <li><a onClick={() => navigate('/marketplace')}>Marketplace</a></li>
          <li><a className="nav-cta" onClick={handleSignOut}>Sign Out</a></li>
        </ul>
      </nav>

      <div className="dash-header">
        <div className="section-label">Admin</div>
        <h1>Admin <em>Dashboard</em></h1>
        <p style={{ color: 'var(--muted)' }}>Manage users, listings, and platform revenue.</p>
      </div>

      <div className="dash-body">

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div className="cpc-card" style={{ padding: '1.25rem' }}>
            <div style={{ color: 'var(--muted)', fontSize: '.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>Total Users</div>
            <div style={{ color: 'var(--white)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '2rem' }}>{stats.totalUsers}</div>
          </div>
          <div className="cpc-card" style={{ padding: '1.25rem' }}>
            <div style={{ color: 'var(--muted)', fontSize: '.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>Total Listings</div>
            <div style={{ color: 'var(--white)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '2rem' }}>{stats.totalListings}</div>
          </div>
          <div className="cpc-card" style={{ padding: '1.25rem' }}>
            <div style={{ color: 'var(--muted)', fontSize: '.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>Total Sales</div>
            <div style={{ color: 'var(--white)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '2rem' }}>{stats.totalSales}</div>
          </div>
          <div className="cpc-card" style={{ padding: '1.25rem' }}>
            <div style={{ color: 'var(--muted)', fontSize: '.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>Platform Revenue</div>
            <div style={{ color: 'var(--green)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '2rem' }}>${stats.totalRevenue.toFixed(2)}</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--navy)', borderRadius: '8px', padding: '4px', marginBottom: '1.5rem', width: 'fit-content' }}>
          <button onClick={() => setActiveTab('users')} style={tabStyle('users')}>Users ({users.length})</button>
          <button onClick={() => setActiveTab('listings')} style={tabStyle('listings')}>Listings ({listings.length})</button>
          <button onClick={() => setActiveTab('sales')} style={tabStyle('sales')}>Sales ({purchases.filter(p => p.status === 'completed').length})</button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {users.map(u => (
              <div key={u.id} className="cpc-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '12px', color: 'var(--navy)', flexShrink: 0 }}>
                  {u.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase' }}>{u.full_name}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '.8rem' }}>{u.email}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="tag" style={{ borderColor: u.role === 'seller' ? 'var(--green-border)' : 'var(--border)', color: u.role === 'seller' ? 'var(--green)' : 'var(--off)' }}>{u.role}</span>
                  {u.is_admin && <span className="tag" style={{ borderColor: '#f59e0b', color: '#f59e0b' }}>Admin</span>}
                  <div style={{ color: 'var(--muted)', fontSize: '.78rem' }}>{new Date(u.created_at).toLocaleDateString()}</div>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: '5px 12px', fontSize: '12px' }}
                    onClick={() => navigate('/coach/' + u.id)}
                  >
                    View
                  </button>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: '5px 12px', fontSize: '12px', borderColor: u.is_admin ? '#f59e0b' : 'var(--border)', color: u.is_admin ? '#f59e0b' : 'var(--muted)' }}
                    onClick={() => toggleAdmin(u.id, u.is_admin)}
                  >
                    {u.is_admin ? 'Remove Admin' : 'Make Admin'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {listings.map(listing => (
              <div key={listing.id} className="cpc-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                {listing.thumbnail_url ? (
                  <img src={listing.thumbnail_url} alt={listing.title} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: 'var(--navy-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>📋</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', marginBottom: '2px' }}>{listing.title}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '.8rem' }}>by {listing.profiles?.full_name} · {listing.sport} · {listing.category}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ color: 'var(--green)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '1.1rem' }}>
                    {listing.price === 0 ? 'FREE' : '$' + Number(listing.price).toFixed(2)}
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '.78rem' }}>{new Date(listing.created_at).toLocaleDateString()}</div>
                  <button className="btn btn-ghost" style={{ padding: '5px 12px', fontSize: '12px' }} onClick={() => navigate('/listing/' + listing.id)}>View</button>
                  <button
                    className="btn"
                    style={{ padding: '5px 12px', fontSize: '12px', background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}
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
            {purchases.filter(p => p.status === 'completed').map(purchase => (
              <div key={purchase.id} className="cpc-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', marginBottom: '2px' }}>{purchase.listings?.title}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '.8rem' }}>Buyer: {purchase.profiles?.full_name}</div>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--white)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '1.1rem' }}>${Number(purchase.amount_total).toFixed(2)}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '.75rem' }}>total</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--green)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '1.1rem' }}>${Number(purchase.amount_platform).toFixed(2)}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '.75rem' }}>your cut</div>
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '.78rem' }}>{new Date(purchase.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
            {purchases.filter(p => p.status === 'completed').length === 0 && (
              <div className="cpc-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--muted)' }}>No completed sales yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}