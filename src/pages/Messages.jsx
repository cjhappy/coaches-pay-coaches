import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import NavMessagesLink from '../components/NavMessagesLink'
import MobileNav from '../components/MobileNav'

export default function Messages() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [conversations, setConversations] = useState([])
  const [activeConvo, setActiveConvo] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => { fetchConversations() }, [])

  useEffect(() => {
    if (activeConvo) {
      fetchMessages(activeConvo.id)
      markAsRead(activeConvo.id)

      const subscription = supabase
        .channel('messages-' + activeConvo.id)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: 'conversation_id=eq.' + activeConvo.id
        }, (payload) => {
          setMessages(prev => {
            const exists = prev.find(m => m.id === payload.new.id)
            if (exists) return prev
            return [...prev, payload.new]
          })
        })
        .subscribe()

      return () => subscription.unsubscribe()
    }
  }, [activeConvo])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchConversations() {
    const { data } = await supabase
      .from('conversations')
      .select('*, buyer:profiles!conversations_buyer_id_fkey(id, full_name, avatar_url), seller:profiles!conversations_seller_id_fkey(id, full_name, avatar_url), listings(id, title, thumbnail_url)')
      .or('buyer_id.eq.' + user.id + ',seller_id.eq.' + user.id)
      .order('updated_at', { ascending: false })

    setConversations(data || [])

    const convoId = searchParams.get('convo')
    if (convoId && data) {
      const found = data.find(c => c.id === convoId)
      if (found) setActiveConvo(found)
    } else if (data && data.length > 0) {
      setActiveConvo(data[0])
    }

    setLoading(false)
  }

  async function fetchMessages(convoId) {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convoId)
      .order('created_at', { ascending: true })
    setMessages(data || [])
  }

  async function markAsRead(convoId) {
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', convoId)
      .neq('sender_id', user.id)
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!newMessage.trim() || !activeConvo) return
    setSending(true)

    const optimisticMsg = {
      id: 'temp-' + Date.now(),
      conversation_id: activeConvo.id,
      sender_id: user.id,
      content: newMessage.trim(),
      read: false,
      created_at: new Date().toISOString()
    }

    setMessages(prev => [...prev, optimisticMsg])
    setNewMessage('')

    const { data } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeConvo.id,
        sender_id: user.id,
        content: optimisticMsg.content
      })
      .select()
      .single()

    if (data) {
      setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? data : m))
    }

    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', activeConvo.id)

    setSending(false)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/auth')
  }

  function getOtherPerson(convo) {
    return user.id === convo.buyer_id ? convo.seller : convo.buyer
  }

  function getInitials(name) {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'
  }

  if (loading) return <div className="page-body" style={{ padding: '4rem 5%', color: 'var(--muted)' }}>Loading...</div>

  return (
    <div className="page-body">
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
          <MobileNav />
          <li><a className="nav-cta" onClick={handleSignOut}>Sign Out</a></li>
        </ul>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', height: 'calc(100vh - 66px)', overflow: 'hidden' }}>

        <div style={{ borderRight: '1px solid var(--border)', overflowY: 'auto', background: 'var(--navy-mid)' }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '1.2rem', textTransform: 'uppercase' }}>Messages</div>
          </div>

          {conversations.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', fontSize: '.9rem' }}>
              No conversations yet. Message a coach from their profile or a listing page.
            </div>
          ) : (
            conversations.map(convo => {
              const other = getOtherPerson(convo)
              const isActive = activeConvo?.id === convo.id
              return (
                <div
                  key={convo.id}
                  onClick={() => setActiveConvo(convo)}
                  style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: isActive ? 'var(--navy-light)' : 'transparent', transition: 'background .15s' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '14px', color: 'var(--navy)', flexShrink: 0 }}>
                      {getInitials(other?.full_name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '.95rem', textTransform: 'uppercase', marginBottom: '2px' }}>{other?.full_name}</div>
                      {convo.listings?.title && (
                        <div style={{ color: 'var(--muted)', fontSize: '.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          re: {convo.listings.title}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {activeConvo ? (
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--navy-mid)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '12px', color: 'var(--navy)' }}>
                {getInitials(getOtherPerson(activeConvo)?.full_name)}
              </div>
              <div>
                <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase' }}>{getOtherPerson(activeConvo)?.full_name}</div>
                {activeConvo.listings?.title && (
                  <div style={{ color: 'var(--muted)', fontSize: '.78rem' }}>re: {activeConvo.listings.title}</div>
                )}
              </div>
              <button
                className="btn btn-ghost"
                style={{ marginLeft: 'auto', padding: '6px 14px', fontSize: '12px' }}
                onClick={() => navigate('/coach/' + getOtherPerson(activeConvo)?.id)}
              >
                View Profile
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '.9rem', marginTop: '2rem' }}>
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.sender_id === user.id
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '65%', padding: '.75rem 1rem',
                        borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                        background: isMe ? 'var(--green)' : 'var(--navy-card)',
                        color: isMe ? 'var(--navy)' : 'var(--off)',
                        fontSize: '.9rem', lineHeight: 1.5,
                        border: isMe ? 'none' : '1px solid var(--border)'
                      }}>
                        {msg.content}
                        <div style={{ fontSize: '.7rem', opacity: 0.6, marginTop: '4px', textAlign: 'right' }}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', background: 'var(--navy-mid)', display: 'flex', gap: '10px' }}>
              <input
                className="form-input"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-green" disabled={sending || !newMessage.trim()} style={{ padding: '0 20px', flexShrink: 0 }}>
                Send
              </button>
            </form>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '1rem' }}>
            Select a conversation to start messaging.
          </div>
        )}
      </div>
    </div>
  )
}