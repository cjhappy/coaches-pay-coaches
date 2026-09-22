const { createClient } = require('@supabase/supabase-js')

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const ALLOWED_ORIGIN = process.env.SITE_URL || 'https://coachespaycoaches.org'
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Fires right after signup, before the new user has a real session yet
// (same situation as attribute-referral.js — email isn't confirmed, so
// this can't be authenticated as "the new user"). Blast radius of abuse is
// low: at worst someone triggers a duplicate welcome email to an address
// that already has an account, which is why this only ever sends once per
// profile, guarded by welcome_email_sent_at.
exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' }

  try {
    const { newUserId } = JSON.parse(event.body)
    if (!newUserId || !UUID_RE.test(newUserId)) {
      return { statusCode: 200, headers, body: JSON.stringify({ sent: false }) }
    }

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, role, welcome_email_sent_at')
      .eq('id', newUserId)
      .single()

    if (error || !profile) {
      return { statusCode: 200, headers, body: JSON.stringify({ sent: false }) }
    }

    // Only sellers (or buyer+seller) get the seller onboarding email, and
    // only once per account.
    const isSeller = profile.role === 'seller' || profile.role === 'both'
    if (!isSeller || profile.welcome_email_sent_at) {
      return { statusCode: 200, headers, body: JSON.stringify({ sent: false }) }
    }

    // Claim it first so a retried/duplicate call can't send twice.
    const { data: claimed } = await supabaseAdmin
      .from('profiles')
      .update({ welcome_email_sent_at: new Date().toISOString() })
      .eq('id', newUserId)
      .is('welcome_email_sent_at', null)
      .select('id')

    if (!claimed || claimed.length === 0) {
      return { statusCode: 200, headers, body: JSON.stringify({ sent: false }) }
    }

    const emailRes = await fetch(`${ALLOWED_ORIGIN}/.netlify/functions/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': process.env.INTERNAL_FUNCTION_SECRET
      },
      body: JSON.stringify({
        type: 'welcome',
        data: {
          sellerEmail: profile.email,
          sellerName: profile.full_name,
        }
      })
    })
    if (!emailRes.ok) {
      console.error('send-email (welcome) returned', emailRes.status, await emailRes.text())
    }

    return { statusCode: 200, headers, body: JSON.stringify({ sent: true }) }
  } catch (err) {
    console.error('Welcome email failed:', err.message)
    // Never let a welcome-email failure look like a signup failure.
    return { statusCode: 200, headers, body: JSON.stringify({ sent: false }) }
  }
}
