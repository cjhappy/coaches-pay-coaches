const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const { createClient } = require('@supabase/supabase-js')

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Used only to verify the caller's identity from their access token.
// Uses the anon key on purpose — auth.getUser() doesn't need elevated privileges.
const supabaseAuth = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const PLATFORM_PERCENT = 0.135
const TRANSACTION_FEE = 0.99
const ALLOWED_ORIGIN = process.env.SITE_URL || 'https://coachespaycoaches.org'

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' }

  try {
    // 1. Verify the request carries a valid, logged-in Supabase session
    const authHeader = event.headers.authorization || event.headers.Authorization
    const token = authHeader?.replace('Bearer ', '')
    if (!token) throw new Error('Not authenticated')

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token)
    if (authError || !user) throw new Error('Not authenticated')

    const { listingId, buyerId } = JSON.parse(event.body)

    // 2. The caller can only ever check out as themselves
    if (buyerId !== user.id) throw new Error('You can only purchase on your own behalf')

    // 3. Never trust a client-supplied redirect origin — always use our own known site URL
    const returnUrl = ALLOWED_ORIGIN

    const { data: listing, error } = await supabaseAdmin
      .from('listings')
      .select('*, profiles(stripe_account_id, full_name)')
      .eq('id', listingId)
      .single()

    if (error || !listing) throw new Error('Listing not found')

    const sellerStripeId = listing.profiles?.stripe_account_id
    if (!sellerStripeId) throw new Error('Seller has not connected Stripe yet')

    // Don't trust profiles.stripe_charges_enabled here — it's only ever
    // updated by the account.updated webhook, and if that webhook is
    // missing/misconfigured on the Stripe side the flag can be permanently
    // stale even though the seller's account is actually fine. Check Stripe
    // directly so a stale flag can never block (or wrongly allow) a sale,
    // and opportunistically self-heal the stored flag while we're at it.
    const sellerAccount = await stripe.accounts.retrieve(sellerStripeId)
    if (!sellerAccount.charges_enabled) {
      throw new Error('Seller has not finished Stripe onboarding yet')
    }

    if (
      sellerAccount.charges_enabled !== listing.profiles?.stripe_charges_enabled ||
      sellerAccount.payouts_enabled !== listing.profiles?.stripe_payouts_enabled
    ) {
      await supabaseAdmin
        .from('profiles')
        .update({
          stripe_charges_enabled: sellerAccount.charges_enabled,
          stripe_payouts_enabled: sellerAccount.payouts_enabled,
        })
        .eq('id', listing.seller_id)
    }

    const priceInCents = Math.round(listing.price * 100)
    const platformFeeInCents = Math.round((listing.price * PLATFORM_PERCENT + TRANSACTION_FEE) * 100)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: listing.title,
            description: `${listing.sport} · ${listing.category}`,
          },
          unit_amount: priceInCents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${returnUrl}/purchases?success=true`,
      cancel_url: `${returnUrl}/listing/${listingId}?cancelled=true`,
      payment_intent_data: {
        application_fee_amount: platformFeeInCents,
        transfer_data: { destination: sellerStripeId },
      },
      metadata: {
        listing_id: listingId,
        buyer_id: buyerId,
        seller_id: listing.seller_id,
        amount_total: listing.price,
        amount_platform: (listing.price * PLATFORM_PERCENT + TRANSACTION_FEE).toFixed(2),
        amount_seller: (listing.price - listing.price * PLATFORM_PERCENT - TRANSACTION_FEE).toFixed(2),
      }
    })

    return { statusCode: 200, headers, body: JSON.stringify({ url: session.url }) }
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) }
  }
}
