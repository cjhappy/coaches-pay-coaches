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

// Reads a seller's Stripe Connect account status directly from Stripe and
// writes it into profiles.stripe_charges_enabled / stripe_payouts_enabled.
//
// This exists because the site previously relied entirely on the
// account.updated webhook to keep those two columns current. If that event
// isn't (or stops being) subscribed to in the Stripe dashboard, or a
// delivery is missed, a seller who fully completes onboarding stays marked
// "not connected" forever — with no way for them or us to tell the
// difference between "still onboarding" and "webhook never arrived". This
// endpoint lets the client ask Stripe directly, on demand, so connect
// status is never dependent on webhook delivery.
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

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.stripe_account_id) {
      return { statusCode: 200, headers, body: JSON.stringify({ connected: false }) }
    }

    const account = await stripe.accounts.retrieve(profile.stripe_account_id)

    await supabaseAdmin
      .from('profiles')
      .update({
        stripe_charges_enabled: account.charges_enabled,
        stripe_payouts_enabled: account.payouts_enabled,
      })
      .eq('id', user.id)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        connected: true,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        requirements_due: account.requirements?.currently_due || [],
      })
    }
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) }
  }
}
