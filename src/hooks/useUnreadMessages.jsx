import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useUnreadMessages() {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return
    fetchUnread()
    const interval = setInterval(fetchUnread, 10000)
    return () => clearInterval(interval)
  }, [user])

  async function fetchUnread() {
    const { data: convos } = await supabase
      .from('conversations')
      .select('id')
      .or('buyer_id.eq.' + user.id + ',seller_id.eq.' + user.id)

    if (!convos || convos.length === 0) { setUnreadCount(0); return }

    const convoIds = convos.map(c => c.id)

    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', convoIds)
      .eq('read', false)
      .neq('sender_id', user.id)

    setUnreadCount(count || 0)
  }

  return unreadCount
}