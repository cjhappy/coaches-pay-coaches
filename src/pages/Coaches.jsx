import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Avatar from '../components/Avatar'
import { Helmet } from 'react-helmet-async'
import SiteNav from '../components/SiteNav'

const SPORTS = ['All', 'Basketball', 'Soccer', 'Football', 'Baseball', 'Softball', 'Hockey', 'Volleyball', 'Lacrosse', 'Tennis', 'Track & Field', 'Swimming', 'Wrestling', 'Golf', 'Gymnastics', 'Cheerleading', 'Dance', 'Cross Country', 'Rugby', 'Field Hockey', 'Water Polo', 'Bowling', 'Cycling', 'Rowing', 'Fencing', 'Skiing', 'Snowboarding', 'Martial Arts', 'Boxing', 'Multi-Sport', 'Other']

export default function Coaches() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [coaches, setCoaches] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sport, setSport] = useState('All')
  const [showFollowing, setShowFollowing] = useState(false)
  const [followingIds, setFollowingIds] = useState([])
  const [visibleCount, setVisibleCount] = useState(24)

  useEffect(() => { fetchCoaches() }, [])
  useEffect(() => { applyFilters(); setVisibleCount(24) }, [coaches, search, sport, showFollowing, followingIds])

  async function fetchCoaches() {
    const { data: sellers } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['seller', 'both'])
      .order('created_at', { ascending: false })

    if (!sellers) { setLoading(false); return }

    const coachesWithStats = await Promise.all(sellers.map(async seller => {
      const { data: listings } = await supabase
        .from('listings')
        .select('id, sport, price')
        .eq('seller_id', seller.id)

      const { count: followerCount } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', seller.id)

      const sports = [...new Set((listings || []).map(l => l.sport))]
      const avgPrice = listings?.length > 0
        ? listings.reduce((sum, l) => sum + Number(l.price), 0) / listings.length
        : 0

      return { ...seller, listings: listings || [], sports, avgPrice, followerCount: followerCount || 0 }
    }))

    setCoaches(coachesWithStats)

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
    let result = [...coaches]
    if (showFollowing) result = result.filter(c => followingIds.includes(c.id))
    if (search) result = result.filter(c =>
      c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.bio?.toLowerCase().includes(search.toLowerCase())
    )
    if (sport !== 'All') result = result.filter(c => c.sports.includes(sport))
    setFiltered(result)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/auth')
  }

  return (
    <div className="page-body cream-page">
      <Helmet>
        <title>Meet the Coaches — Coaches Pay Coaches</title>
        <meta name="description" content="Browse coach profiles from real youth sports coaches across every sport. Follow coaches and discover their resources." />
        <meta property="og:title" content="Meet the Coaches — Coaches Pay Coaches" />
        <meta property="og:url" content="https://coachespaycoaches.org/coaches" />
      </Helmet>

      <SiteNav active="coaches" />

      <div style={{ background: 'var(--navy)', padding: '3rem 5% 2rem' }}>
        <div className="section-label">Community</div>
        <h1 className="section-title" style={{ color: 'var(--white)' }}>Meet the <em>Coaches</em></h1>
        <p style={{ color: 'var(--off)', opacity: .85, maxWidth: '520px', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Real coaches. Real experience. Every sport. Browse profiles, explore their stores, and find resources that elevate your program.
        </p>
        <div style={{ position: 'relative', maxWidth: '480px' }}>
          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>🔍</span>
          <input
            className="form-input"
            style={{ paddingLeft: '2.5rem', background: 'var(--navy-light)', borderColor: 'var(--border)', color: 'var(--white)' }}
            placeholder="Search coaches by name or specialty..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={{ padding: '2rem 5%' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {user && (
            <button
              onClick={() => setShowFollowing(!showFollowing)}
              style={{
                padding: '8px 18px', borderRadius: '100px', border: '1px solid',
                borderColor: showFollowing ? 'var(--navy)' : 'var(--border-on-cream)',
                background: showFollowing ? 'var(--yellow)' : 'transparent',
                color: 'var(--navy)',
                fontSize: '.85rem', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font-sub)', textTransform: 'uppercase',
                letterSpacing: '.05em', transition: 'all .2s'
              }}
            >
              {showFollowing ? '✓ Following' : 'Following'}
            </button>
          )}
          <div className="muted" style={{ fontSize: '.85rem' }}>
            {filtered.length} coach{filtered.length !== 1 ? 'es' : ''}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {SPORTS.map(s => (
            <button
              key={s}
              onClick={() => setSport(s)}
              style={{
                padding: '6px 14px', borderRadius: '100px', border: '1px solid',
                borderColor: sport === s ? 'var(--navy)' : 'var(--border-on-cream)',
                background: sport === s ? 'var(--yellow)' : 'transparent',
                color: 'var(--navy)',
                fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all .2s',
                fontFamily: 'var(--font-sub)', textTransform: 'uppercase', letterSpacing: '.05em'
              }}
            >{s}</button>
          ))}
        </div>

        {loading ? (
          <p className="muted">Loading coaches...</p>
        ) : filtered.length === 0 ? (
          <div className="cpc-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p className="muted" style={{ fontSize: '1.1rem' }}>
              {showFollowing ? 'You are not following anyone yet.' : 'No coaches found.'}
            </p>
            {showFollowing && (
              <button className="btn btn-green" style={{ marginTop: '1rem' }} onClick={() => setShowFollowing(false)}>
                Browse All Coaches
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {filtered.slice(0, visibleCount).map(coach => (
              <div
                key={coach.id}
                className="cpc-card"
                style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '1rem' }}
                onClick={() => navigate('/coach/' + coach.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Avatar url={coach.avatar_url} name={coach.full_name} size={60} radius={14} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: '1.1rem', textTransform: 'uppercase', color: 'var(--navy)' }}>
                        {coach.full_name}
                      </div>
                      {coach.verified && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center',
                          background: 'var(--yellow)', border: '1px solid var(--navy)',
                          color: 'var(--navy)', fontSize: '9px', fontWeight: 700,
                          padding: '2px 7px', borderRadius: '100px', letterSpacing: '.06em',
                          textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0
                        }}>
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {coach.sports.slice(0, 3).map(s => <span key={s} className="tag" style={{ fontSize: '.7rem' }}>{s}</span>)}
                    </div>
                  </div>
                </div>

                {coach.bio && (
                  <p className="muted" style={{ fontSize: '.88rem', lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {coach.bio}
                  </p>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border-on-cream)' }}>
                  <div style={{ display: 'flex', gap: '1.25rem' }}>
                    <div>
                      <div style={{ color: 'var(--navy)', fontFamily: 'var(--font-sub)', fontWeight: 900, fontSize: '1.2rem', lineHeight: 1 }}>{coach.listings.length}</div>
                      <div className="muted" style={{ fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>Resources</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--navy)', fontFamily: 'var(--font-sub)', fontWeight: 900, fontSize: '1.2rem', lineHeight: 1 }}>{coach.followerCount}</div>
                      <div className="muted" style={{ fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>Followers</div>
                    </div>
                  </div>
                  <button
                    className="btn btn-green"
                    style={{ padding: '8px 18px', fontSize: '13px' }}
                    onClick={e => { e.stopPropagation(); navigate('/coach/' + coach.id) }}
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filtered.length > visibleCount && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button className="btn btn-ghost-dark" onClick={() => setVisibleCount(c => c + 24)}>
              Load More ({filtered.length - visibleCount} more)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}