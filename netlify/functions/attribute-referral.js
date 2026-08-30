const { createClient } = require('@supabase/supabase-js')

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const ALLOWED_ORIGIN = process.env.SITE_URL || 'https://coachespaycoaches.org'
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' }

  try {
    const { newUserId, refCode } = JSON.parse(event.body)

    // Runs right after signup, before the new user has a real session yet
    // (they haven't confirmed their email), so this can't be authenticated
    // as "the new user" the way our other functions are. The blast radius
    // of abuse here is low — referred_by only powers a display counter,
    // never money or access — but we still only ever set it once, and only
    // on a real, freshly-created, still-unattributed account.
    if (!newUserId || !UUID_RE.test(newUserId) || !refCode) {
      return { statusCode: 200, headers, body: JSON.stringify({ attributed: false }) }
    }

    const { data: referrer } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('referral_code', refCode)
      .maybeSingle()

    if (!referrer || referrer.id === newUserId) {
      return { statusCode: 200, headers, body: JSON.stringify({ attributed: false }) }
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ referred_by: referrer.id })
      .eq('id', newUserId)
      .is('referred_by', null) // never overwrite an existing attribution
      .select('id')

    if (error) throw error

    return { statusCode: 200, headers, body: JSON.stringify({ attributed: (data || []).length > 0 }) }
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) }
  }
}
