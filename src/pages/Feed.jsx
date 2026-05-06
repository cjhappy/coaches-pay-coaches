import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Avatar from '../components/Avatar'
import NavMessagesLink from '../components/NavMessagesLink'

function PostCard({ post, currentUser, onDelete }) {
  const navigate = useNavigate()
  const [liked, setLiked] = useState(post.liked)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [likeLoading, setLikeLoading] = useState(false)

  async function handleLike() {
    if (!currentUser) { navigate('/auth'); return }
    setLikeLoading(true)
    if (liked) {
      await supabase.from('likes').delete()
        .eq('user_id', currentUser.id)
        .eq('post_id', post.id)
      setLiked(false)
      setLikeCount(prev => prev - 1)
    } else {
      await supabase.from('likes').insert({ user_id: currentUser.id, post_id: post.id })
      setLiked(true)
      setLikeCount(prev => prev + 1)
    }
    setLikeLoading(false)
  }

  function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago'
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago'
    return Math.floor(seconds / 86400) + 'd ago'
  }

  return (
    <div className="cpc-card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', gap: '12px' }}>
        <div onClick={() => navigate('/coach/' + post.author_id)} style={{ cursor: 'pointer', flexShrink: 0 }}>
          <Avatar url={post.profiles?.avatar_url} name={post.profiles?.full_name} size={44} radius={12} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', flexWrap: 'wrap', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span
                onClick={() => navigate('/coach/' + post.author_id)}
                style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase', cursor: 'pointer', color: 'var(--white)' }}
              >
                {post.profiles?.full_name}
              </span>
              <span style={{ color: 'var(--muted)', fontSize: '.78rem' }}>{timeAgo(post.created_at)}</span>
            </div>
            {currentUser?.id === post.author_id && (
              <button
                onClick={() => onDelete(post.id)}
                style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '.8rem', padding: '2px 6px' }}
              >
                Delete
              </button>
            )}
          </div>

          <p style={{ color: 'var(--off)', fontSize: '.95rem', lineHeight: 1.7, marginBottom: '1rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {post.content}
          </p>

          {post.image_url && (
            <img src={post.image_url} alt="post" style={{ width: '100%', borderRadius: '10px', marginBottom: '1rem', maxHeight: '400px', objectFit: 'cover' }} />
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
            <button
              onClick={handleLike}
              disabled={likeLoading}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                color: liked ? '#f43f5e' : 'var(--muted)',
                fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
                fontSize: '.9rem', transition: 'color .2s', padding: 0
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{liked ? '❤️' : '🤍'}</span>
              {likeCount > 0 && <span>{likeCount}</span>}
              <span>{liked ? 'Liked' : 'Like'}</span>
            </button>

            <button
              onClick={() => navigate('/coach/' + post.author_id)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                color: 'var(--muted)', fontFamily: 'Barlow Condensed, sans-serif',
                fontWeight: 700, fontSize: '.9rem', padding: 0
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>👤</span>
              <span>View Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CreatePost({ onPost, profile }) {
  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)
  const { user } = useAuth()

  async function handlePost(e) {
    e.preventDefault()
    if (!content.trim()) return
    setPosting(true)
    const { data } = await supabase.from('posts').insert({
      author_id: user.id,
      content: content.trim()
    }).select('*, profiles(full_name, avatar_url)').single()
    if (data) onPost(data)
    setContent('')
    setPosting(false)
  }

  return (
    <div className="cpc-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '12px' }}>
        <Avatar url={profile?.avatar_url} name={profile?.full_name} size={44} radius={12} />
        <div style={{ flex: 1 }}>
          <textarea
            className="form-input"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Share a tip, drill, or update with the community..."
            rows={3}
            style={{ resize: 'none', marginBottom: '0.75rem', fontSize: '.95rem' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-green"
              onClick={handlePost}
              disabled={posting || !content.trim()}
              style={{ padding: '8px 24px', fontSize: '13px' }}
            >
              {posting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Feed() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [followingIds, setFollowingIds] = useState([])

  useEffect(() => { fetchPosts() }, [])

  async function fetchPosts() {
    const { data: postsData } = await supabase
      .from('posts')
      .select('*, profiles(full_name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(50)

    if (!postsData) { setLoading(false); return }

    const postIds = postsData.map(p => p.id)
    const { data: likesData } = await supabase
      .from('likes')
      .select('post_id, user_id')
      .in('post_id', postIds)

    const likeMap = {}
    likesData?.forEach(l => {
      if (!likeMap[l.post_id]) likeMap[l.post_id] = { count: 0, likedByMe: false }
      likeMap[l.post_id].count++
      if (l.user_id === user?.id) likeMap[l.post_id].likedByMe = true
    })

    const enriched = postsData.map(p => ({
      ...p,
      likeCount: likeMap[p.id]?.count || 0,
      liked: likeMap[p.id]?.likedByMe || false
    }))

    setPosts(enriched)

    if (user) {
      const { data: followingData } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', user.id)
      setFollowingIds((followingData || []).map(f => f.following_id))
    }

    setLoading(false)
  }

  async function handleDelete(postId) {
    if (!confirm('Delete this post?')) return
    await supabase.from('posts').delete().eq('id', postId)
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  function handleNewPost(post) {
    const enriched = { ...post, likeCount: 0, liked: false }
    setPosts(prev => [enriched, ...prev])
  }

  async function handleSignOut() {
    await signOut()
    navigate('/auth')
  }

  const filtered = filter === 'following'
    ? posts.filter(p => followingIds.includes(p.author_id) || p.author_id === user?.id)
    : posts

  return (
    <div className="page-body">
      <nav className="cpc-nav">
        <a className="cpc-logo" onClick={() => navigate('/')}>
          <div className="logo-badge">CPC</div>
          <div className="logo-text">COACHES <em>PAY</em> COACHES</div>
        </a>
        <ul className="nav-links">
          <li><a onClick={() => navigate('/feed')}>Feed</a></li>
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

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '2rem 5%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="section-label" style={{ marginBottom: '4px' }}>Community</div>
            <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 'clamp(24px, 4vw, 36px)', textTransform: 'uppercase', lineHeight: 1 }}>
              The <em style={{ color: 'var(--green)', fontStyle: 'normal' }}>Feed</em>
            </h1>
          </div>

          {user && (
            <div style={{ display: 'flex', gap: '4px', background: 'var(--navy-card)', borderRadius: '8px', padding: '4px' }}>
              <button
                onClick={() => setFilter('all')}
                style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '.85rem', textTransform: 'uppercase', background: filter === 'all' ? 'var(--green)' : 'transparent', color: filter === 'all' ? 'var(--navy)' : 'var(--muted)', transition: 'all .2s' }}
              >
                All
              </button>
              <button
                onClick={() => setFilter('following')}
                style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '.85rem', textTransform: 'uppercase', background: filter === 'following' ? 'var(--green)' : 'transparent', color: filter === 'following' ? 'var(--navy)' : 'var(--muted)', transition: 'all .2s' }}
              >
                Following
              </button>
            </div>
          )}
        </div>

        {user && <CreatePost onPost={handleNewPost} profile={profile} />}

        {loading ? (
          <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem' }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="cpc-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--muted)', fontSize: '1rem', marginBottom: '1rem' }}>
              {filter === 'following' ? 'No posts from coaches you follow yet.' : 'No posts yet. Be the first to post!'}
            </p>
            {filter === 'following' && (
              <button className="btn btn-green" onClick={() => navigate('/coaches')}>Discover Coaches</button>
            )}
          </div>
        ) : (
          filtered.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={user}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  )
}