const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
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

    const { userId } = JSON.parse(event.body)
    if (userId !== user.id) throw new Error('You can only disconnect your own account')

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', userId)
      .single()

    const accountId = profile?.stripe_account_id

    // Actually remove the connected account on Stripe's side, not just our
    // own reference to it — otherwise every disconnect + reconnect cycle
    // leaves an orphaned account sitting in the Stripe dashboard forever.
    if (accountId) {
      try {
        await stripe.accounts.del(accountId)
      } catch (stripeErr) {
        // If Stripe can't delete it (e.g. it already has a balance or was
        // already removed), don't block the user from disconnecting in our
        // own app — just log it so it can be cleaned up manually if needed.
        console.error('Stripe account deletion failed for', accountId, ':', stripeErr.message)
      }
    }

    await supabaseAdmin
      .from('profiles')
      .update({ stripe_account_id: null, stripe_charges_enabled: false, stripe_payouts_enabled: false })
      .eq('id', userId)

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) }
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) }
  }
}
