import { supabase } from './supabase'

/**
 * Creates a notification for another user. Never throws — a failed
 * notification insert shouldn't ever block the action that triggered it
 * (following someone, leaving a review, etc.), so this fails silently and
 * just logs to the console.
 */
export async function notify({ userId, type, actorId, actorName, contentId, contentTitle }) {
  if (!userId || userId === actorId) return // don't notify yourself
  try {
    await supabase.from('notifications').insert({
      user_id: userId,
      type,
      actor_id: actorId,
      actor_name: actorName,
      content_id: contentId || null,
      content_title: contentTitle || null,
    })
  } catch (err) {
    console.error('Failed to create notification:', err.message)
  }
}
