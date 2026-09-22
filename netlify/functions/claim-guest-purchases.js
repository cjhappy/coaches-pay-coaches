const { createClient } = require('@supabase/supabase-js')

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const ALLOWED_ORIGIN = process.env.SITE_URL || 'https://coachespaycoaches.org'
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Links any past guest purchases made with this email to the new account,
// so "create a free account with this same email and it'll show up in
// your library" (promised in the guest purchase confirmation email) is
// actually true.
//
// Safe to run right after signup, before the email is confirmed: the new
// account can't actually be logged into until Supabase's own email
// confirmation link is clicked, so nobody can claim purchases made to an
// inbox they don't control — by the time they can log in, they've already
// proven they own that inbox.
exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' }

  try {
    const { newUserId, email } = JSON.parse(event.body)
    if (!newUserId || !UUID_RE.test(newUserId) || !email) {
      return { statusCode: 200, headers, body: JSON.stringify({ claimed: 0 }) }
    }

    const { data, error } = await supabaseAdmin
      .from('purchases')
      .update({ buyer_id: newUserId })
      .is('buyer_id', null)
      .eq('guest_email', email)
      .select('id')

    if (error) throw error

    return { statusCode: 200, headers, body: JSON.stringify({ claimed: (data || []).length }) }
  } catch (err) {
    console.error('Guest purchase claim failed:', err.message)
    return { statusCode: 200, headers, body: JSON.stringify({ claimed: 0 }) }
  }
}
