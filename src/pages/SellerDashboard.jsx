import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ListingForm from '../components/ListingForm'
import Avatar from '../components/Avatar'
import NavMessagesLink from '../components/NavMessagesLink'

function AvatarUploader({ profile, onUpdate }) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(profile?.avatar_url || null)

 async function handleUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  setUploading(true)
  const ext = file.name.split('.').pop()
  const path = profile.id + '/avatar.' + ext
  console.log('Uploading to path:', path)
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true })
  console.log('Upload error:', uploadError)
  if (!uploadError) {
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    console.log('Public URL:', publicUrl)
    const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id)
    console.log('Update error:', updateError)
    const bustUrl = publicUrl + '?t=' + Date.now()
    setPreviewUrl(bustUrl)
    onUpdate(bustUrl)
  }
  setUploading(false)
}

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
      <Avatar url={previewUrl} name={profile?.full_name} size={80} radius={16} />
      <div>
        <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '.9rem', textTransform: 'uppercase', marginBottom: '6px' }}>Profile Photo</div>
        <label style={{ cursor: 'pointer' }}>
          <span className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '12px', pointerEvents: 'none' }}>
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </span>
          <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
        </label>
      </div>
    </div>
  )
}

function BioEditor({ profile, setProfile }) {
  const [bio, setBio] = useState(profile?.bio || '')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const wordCount = bio.trim() === '' ? 0 : bio.trim().split(/\s+/).length
  const overLimit = wordCount > 150

  async function saveBio() {
    if (overLimit) return
    setSaving(true)
    await supabase.from('profiles').update({ bio }).eq('id', profile.id)
    setSaving(false)
    setEditing(false)
  }

  return (
    <div className="cpc-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
      <AvatarUploader
        profile={profile}
        onUpdate={(url) => setProfile(prev => ({ ...prev, avatar_url: url }))}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: editing ? '1rem' : '0' }}>
        <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase' }}>Your Bio</div>
        <button className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={() => setEditing(!editing)}>
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>
      {editing ? (
        <>
          <textarea
            className="form-input"
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={3}
            placeholder="Tell buyers about your coaching background, experience, and specialties..."
            style={{ resize: 'vertical', marginBottom: '0.5rem', borderColor: overLimit ? '#f87171' : undefined }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '.78rem', color: overLimit ? '#f87171' : 'var(--muted)' }}>
              {wordCount}/150 words {overLimit && '— over limit'}
            </span>
          </div>
          <button className="btn btn-green" style={{ padding: '8px 20px', fontSize: '13px', opacity: overLimit ? 0.5 : 1 }} onClick={saveBio} disabled={saving || overLimit}>
            {saving ? 'Saving...' : 'Save Bio'}
          </button>
        </>
      ) : (
        <p style={{ color: bio ? 'var(--off)' : 'var(--muted)', fontSize: '.9rem', lineHeight: 1.6, marginTop: '8px' }}>
          {bio || 'No bio yet — click Edit to add one.'}
        </p>
      )}
    </div>
  )
}

export default function SellerDashboard() {
  const { user, profile, setProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [listings, setListings] = useState([])
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editListing, setEditListing] = useState(null)
  const [stripeLoading, setStripeLoading] = useState(false)
  const [disconnectLoading, setDisconnectLoading] = useState(false)
  const [stripeStatus, setStripeStatus] = useState(null)
  const [activeTab, setActiveTab] = useState('listings')

  useEffect(() => {
    fetchListings()
    fetchSales()
    if (searchParams.get('stripe') === 'success') setStripeStatus('success')
    if (searchParams.get('stripe') === 'refresh') setStripeStatus('refresh')
  }, [])

  async function fetchListings() {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('seller_id', profile.id)
      .order('created_at', { ascending: false })
    if (!error) setListings(data)
    setLoading(false)
  }

  async function fetchSales() {
    const { data, error } = await supabase
      .from('purchases')
      .select('*, listings(title, sport, category, thumbnail_url)')
      .eq('seller_id', profile.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
    if (!error) setSales(data)
  }

  async function deleteListing(id) {
    if (!confirm('Delete this listing?')) return
    await supabase.from('listings').delete().eq('id', id)
    setListings(prev => prev.filter(l => l.id !== id))
  }

  async function handleConnectStripe() {
    setStripeLoading(true)
    try {
      const res = await fetch('/.netlify/functions/stripe-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, returnUrl: window.location.origin })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      window.location.href = data.url
    } catch (err) {
      alert(err.message)
    }
    setStripeLoading(false)
  }

  async function handleDisconnectStripe() {
    if (!confirm('Are you sure you want to disconnect Stripe? You won\'t be able to receive payouts until you reconnect.')) return
    setDisconnectLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          stripe_account_id: null,
          stripe_charges_enabled: false,
          stripe_payouts_enabled: false,
        })
        .eq('id', profile.id)
      if (error) throw error
      setProfile(prev => ({
        ...prev,
        stripe_account_id: null,
        stripe_charges_enabled: false,
        stripe_payouts_enabled: false,
      }))
      setStripeStatus(null)
    } catch (err) {
      alert('Failed to disconnect Stripe: ' + err.message)
    }
    setDisconnectLoading(false)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/auth')
  }

  const stripeConnected = !!profile?.stripe_account_id
  const stripeFullyActive = stripeConnected && profile?.stripe_charges_enabled && profile?.stripe_payouts_enabled
  const stripeIncomplete = stripeConnected && !stripeFullyActive
  const totalEarnings = sales.reduce((sum, s) => sum + Number(s.amount_seller), 0)
  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.amount_total), 0)

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
          <li><a onClick={() => navigate('/coaches')}>Coaches</a></li>
          <NavMessagesLink />
          <li><a className="nav-cta" onClick={handleSignOut}>Sign Out</a></li>
        </ul>
      </nav>

      <div className="dash-header">
        <div className="section-label">Seller Dashboard</div>
        <h1>Your <em>Store</em></h1>
        <p style={{ color: 'var(--muted)' }}>Hello, {profile?.full_name} — manage your coaching materials below.</p>
      </div>

      <div className="dash-body">

        {/* Not connected — prompt to connect */}
        {!stripeConnected && (
          <div className="cpc-card" style={{ padding: '1.5rem', marginBottom: '2rem', borderColor: 'var(--green-border)', background: 'var(--green-dim)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '1.1rem', textTransform: 'uppercase', marginBottom: '4px' }}>Connect Stripe to Get Paid</div>
              <p style={{ color: 'var(--muted)', fontSize: '.88rem' }}>Connect a Stripe account before buyers can purchase your listings.</p>
            </div>
            <button className="btn btn-green" onClick={handleConnectStripe} disabled={stripeLoading}>
              {stripeLoading ? 'Connecting...' : 'Connect Stripe'}
            </button>
          </div>
        )}

        {/* Connected but onboarding incomplete — warn seller */}
        {stripeIncomplete && (
          <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', color: '#fbbf24', marginBottom: '4px' }}>⚠ Stripe Setup Incomplete</div>
              <p style={{ color: 'var(--muted)', fontSize: '.85rem', margin: 0 }}>
                Your Stripe account isn't fully set up yet.{' '}
                {!profile?.stripe_charges_enabled && 'Charges are not enabled. '}
                {!profile?.stripe_payouts_enabled && 'Payouts are not enabled. '}
                Complete your Stripe onboarding to start receiving payments.
              </p>
            </div>
            <button className="btn" style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)', whiteSpace: 'nowrap' }} onClick={handleConnectStripe} disabled={stripeLoading}>
              {stripeLoading ? 'Loading...' : 'Finish Setup'}
            </button>
          </div>
        )}

        {/* Connected and fully active — show status + disconnect option */}
        {stripeFullyActive && (
          <div style={{ background: 'var(--green-dim)', border: '1px solid var(--green-border)', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ color: 'var(--green)', fontSize: '.9rem' }}>
              ✓ Stripe connected — payouts active
            </div>
            <button
              className="btn"
              style={{ background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', fontSize: '12px', padding: '6px 14px' }}
              onClick={handleDisconnectStripe}
              disabled={disconnectLoading}
            >
              {disconnectLoading ? 'Disconnecting...' : 'Disconnect Stripe'}
            </button>
          </div>
        )}

        {stripeConnected && stripeStatus === 'success' && (
          <div style={{ background: 'var(--green-dim)', border: '1px solid var(--green-border)', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.5rem', color: 'var(--green)', fontSize: '.9rem' }}>
            Stripe connected! Buyers can now purchase your listings.
          </div>
        )}

        {stripeStatus === 'refresh' && (
          <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.5rem', color: '#f87171', fontSize: '.9rem' }}>
            Stripe connection incomplete. Please try again.
          </div>
        )}

        <BioEditor profile={profile} setProfile={setProfile} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div className="cpc-card" style={{ padding: '1.25rem' }}>
            <div style={{ color: 'var(--muted)', fontSize: '.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>Total Earnings</div>
            <div style={{ color: 'var(--green)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '2rem' }}>${totalEarnings.toFixed(2)}</div>
            <div style={{ color: 'var(--muted)', fontSize: '.78rem', marginTop: '4px' }}>after platform fees</div>
          </div>
          <div className="cpc-card" style={{ padding: '1.25rem' }}>
            <div style={{ color: 'var(--muted)', fontSize: '.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>Total Sales</div>
            <div style={{ color: 'var(--white)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '2rem' }}>{sales.length}</div>
            <div style={{ color: 'var(--muted)', fontSize: '.78rem', marginTop: '4px' }}>completed orders</div>
          </div>
          <div className="cpc-card" style={{ padding: '1.25rem' }}>
            <div style={{ color: 'var(--muted)', fontSize: '.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>Gross Revenue</div>
            <div style={{ color: 'var(--white)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '2rem' }}>${totalRevenue.toFixed(2)}</div>
            <div style={{ color: 'var(--muted)', fontSize: '.78rem', marginTop: '4px' }}>before platform fees</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '4px', background: 'var(--navy)', borderRadius: '8px', padding: '4px', marginBottom: '1.5rem', width: 'fit-content' }}>
          <button onClick={() => setActiveTab('listings')} style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontFamily: 'Barlow, sans-serif', fontSize: '.9rem', fontWeight: 500, transition: 'all .2s', background: activeTab === 'listings' ? 'var(--green)' : 'transparent', color: activeTab === 'listings' ? 'var(--navy)' : 'var(--muted)' }}>
            Listings ({listings.length})
          </button>
          <button onClick={() => setActiveTab('sales')} style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontFamily: 'Barlow, sans-serif', fontSize: '.9rem', fontWeight: 500, transition: 'all .2s', background: activeTab === 'sales' ? 'var(--green)' : 'transparent', color: activeTab === 'sales' ? 'var(--navy)' : 'var(--muted)' }}>
            Sales ({sales.length})
          </button>
        </div>

        {activeTab === 'listings' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div className="section-label" style={{ margin: 0 }}>Your Listings</div>
              <button className="btn btn-green" onClick={() => { setEditListing(null); setShowForm(true) }}>+ New Listing</button>
            </div>
            {showForm && (
              <ListingForm
                listing={editListing}
                onSave={() => { setShowForm(false); fetchListings() }}
                onCancel={() => setShowForm(false)}
              />
            )}
            {loading ? (
              <p style={{ color: 'var(--muted)' }}>Loading...</p>
            ) : listings.length === 0 ? (
              <div className="cpc-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>No listings yet.</p>
                <button className="btn btn-green" onClick={() => setShowForm(true)}>Upload a Resource</button>
              </div>
            ) : (
              <div className="dash-grid">
                {listings.map(listing => (
                  <div key={listing.id} className="cpc-card" style={{ padding: '1.25rem' }}>
                    {listing.thumbnail_url && (
                      <img src={listing.thumbnail_url} alt={listing.title} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} />
                    )}
                    <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '1.05rem', textTransform: 'uppercase', marginBottom: '4px' }}>{listing.title}</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <span className="tag">{listing.sport}</span>
                      <span className="tag">{listing.category}</span>
                    </div>
                    <div style={{ color: 'var(--green)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '1.15rem', marginBottom: '1rem' }}>
                      {listing.price === 0 ? 'FREE' : '$' + Number(listing.price).toFixed(2)}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-ghost" style={{ flex: 1, padding: '8px', fontSize: '13px' }} onClick={() => { setEditListing(listing); setShowForm(true) }}>Edit</button>
                      <button className="btn" style={{ flex: 1, padding: '8px', fontSize: '13px', background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }} onClick={() => deleteListing(listing.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'sales' && (
          <>
            <div className="section-label" style={{ marginBottom: '1rem' }}>Recent Sales</div>
            {sales.length === 0 ? (
              <div className="cpc-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--muted)' }}>No sales yet. Share your listings to start earning!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {sales.map(sale => (
                  <div key={sale.id} className="cpc-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                    {sale.listings?.thumbnail_url ? (
                      <img src={sale.listings.thumbnail_url} alt={sale.listings.title} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: '70px', height: '70px', borderRadius: '8px', background: 'var(--navy-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', flexShrink: 0 }}>📋</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', marginBottom: '4px' }}>{sale.listings?.title}</div>
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                        <span className="tag">{sale.listings?.sport}</span>
                        <span className="tag">{sale.listings?.category}</span>
                      </div>
                      <div style={{ color: 'var(--muted)', fontSize: '.78rem' }}>{new Date(sale.created_at).toLocaleDateString()}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ color: 'var(--green)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '1.2rem' }}>+${Number(sale.amount_seller).toFixed(2)}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '.75rem' }}>of ${Number(sale.amount_total).toFixed(2)} total</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}