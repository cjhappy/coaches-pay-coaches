const { createClient } = require('@supabase/supabase-js')

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const supabaseAuth = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const ALLOWED_ORIGIN = process.env.SITE_URL || 'https://coachespaycoaches.org'
const COMMENT_PREVIEW_LIMIT = 300

// Emails the seller when someone comments on their listing — parity with
// the review/sale emails. The browser can't call send-email directly (it
// requires an internal secret only our own functions know), so this
// function verifies the caller is a real logged-in user, looks up
// everything server-side, and relays to send-email itself.
exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' }

  try {
    const authHeader = event.headers.authorization || event.headers.Authorization
    const token = authHeader?.replace('Bearer ', '')
    if (!token) throw new Error('Not authenticated')

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token)
    if (authError || !user) throw new Error('Not authenticated')

    const { listingId, commentText } = JSON.parse(event.body)
    if (!listingId || !commentText) {
      return { statusCode: 200, headers, body: JSON.stringify({ sent: false }) }
    }

    const { data: listing } = await supabaseAdmin
      .from('listings')
      .select('title, seller_id')
      .eq('id', listingId)
      .single()

    if (!listing || listing.seller_id === user.id) {
      // No listing, or the seller commenting on their own listing —
      // nothing to notify.
      return { statusCode: 200, headers, body: JSON.stringify({ sent: false }) }
    }

    const { data: seller } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email')
      .eq('id', listing.seller_id)
      .single()

    const { data: commenter } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    if (!seller?.email) {
      return { statusCode: 200, headers, body: JSON.stringify({ sent: false }) }
    }

    await fetch(`${ALLOWED_ORIGIN}/.netlify/functions/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': process.env.INTERNAL_FUNCTION_SECRET
      },
      body: JSON.stringify({
        type: 'comment',
        data: {
          sellerEmail: seller.email,
          commenterName: commenter?.full_name || 'A coach',
          listingId,
          listingTitle: listing.title,
          commentText: commentText.slice(0, COMMENT_PREVIEW_LIMIT),
        }
      })
    })

    return { statusCode: 200, headers, body: JSON.stringify({ sent: true }) }
  } catch (err) {
    console.error('Comment notification failed:', err.message)
    // Never let a failed notification look like the comment itself failed.
    return { statusCode: 200, headers, body: JSON.stringify({ sent: false }) }
  }
}
