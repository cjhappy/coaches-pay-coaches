const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

exports.handler = async (event) => {
  const sig = event.headers['stripe-signature']
  let stripeEvent

  // 1. Verify Stripe signature
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    return { statusCode: 400, body: 'Webhook Error: ' + err.message }
  }

  // 2. Return 200 immediately
  const response = { statusCode: 200, body: JSON.stringify({ received: true }) }

  // 3. Check for duplicate event
  const { data: existing, error: lookupError } = await supabase
    .from('processed_webhook_events')
    .select('id')
    .eq('stripe_event_id', stripeEvent.id)
    .maybeSingle()

  if (lookupError) {
    console.error('Idempotency lookup error:', lookupError.message)
    return response
  }

  if (existing) {
    console.log(`Duplicate event skipped: ${stripeEvent.id}`)
    return response
  }

  // 4. Mark event as processed
  const { error: insertError } = await supabase
    .from('processed_webhook_events')
    .insert({ stripe_event_id: stripeEvent.id })

  if (insertError) {
    console.error('Failed to record event ID:', insertError.message)
    return response
  }

  // 5. Handle events
  try {
    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object
      const { listing_id, buyer_id, seller_id, amount_total, amount_seller, amount_platform, is_guest } = session.metadata
      const isGuest = is_guest === 'true' || !buyer_id

      // Stripe Checkout always collects an email in payment mode, even for
      // a guest with no account — that's the only contact info we have for
      // them, so it's what the download link gets sent to.
      const guestEmail = isGuest ? (session.customer_details?.email || session.customer_email || null) : null
      const guestName = isGuest ? (session.customer_details?.name || 'Coach') : null

      // Fetch listing snapshot before inserting purchase
      const { data: listing } = await supabase
        .from('listings')
        .select('title, sport, category, thumbnail_url, file_name, file_url')
        .eq('id', listing_id)
        .single()

      await supabase.from('purchases').insert({
        buyer_id: isGuest ? null : buyer_id,
        guest_email: guestEmail,
        listing_id,
        seller_id,
        amount_total: parseFloat(amount_total),
        amount_seller: parseFloat(amount_seller),
        amount_platform: parseFloat(amount_platform),
        stripe_session_id: session.id,
        status: 'completed',
        // Snapshot of listing at time of purchase
        listing_title: listing?.title || null,
        listing_sport: listing?.sport || null,
        listing_category: listing?.category || null,
        listing_thumbnail_url: listing?.thumbnail_url || null,
        listing_file_name: listing?.file_name || null,
        listing_file_url: listing?.file_url || null,
      })

      const { data: seller } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', seller_id)
        .single()

      let buyerName = guestName
      let buyerEmail = guestEmail

      if (!isGuest) {
        const { data: buyer } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', buyer_id)
          .single()

        buyerName = buyer?.full_name
        buyerEmail = buyer?.email

        if (listing && buyer && seller) {
          // In-app notification for the seller, alongside the email below.
          // Uses the service-role client, so this runs regardless of RLS.
          // (Guest buyers have no profile row to notify from, so this only
          // applies to logged-in purchases.)
          await supabase.from('notifications').insert({
            user_id: seller_id,
            type: 'sale',
            actor_id: buyer_id,
            actor_name: buyer.full_name,
            content_id: listing_id,
            content_title: listing.title,
          })
        }
      }

      // Guests have no library to log back into, so instead of pointing
      // them at /purchases like the email does for logged-in buyers, hand
      // them a direct signed download link good for 30 days.
      let buyerDownloadUrl = null
      if (isGuest && listing?.file_url) {
        const { data: signed } = await supabase.storage
          .from('listings-files')
          .createSignedUrl(listing.file_url, 60 * 60 * 24 * 30)
        buyerDownloadUrl = signed?.signedUrl || null
      }

      if (listing && seller && buyerEmail) {
        await fetch(`${process.env.SITE_URL}/.netlify/functions/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': process.env.INTERNAL_FUNCTION_SECRET
          },
          body: JSON.stringify({
            type: 'sale',
            data: {
              sellerEmail: seller.email,
              sellerName: seller.full_name,
              buyerEmail,
              buyerName,
              listingTitle: listing.title,
              amountTotal: parseFloat(amount_total).toFixed(2),
              amountSeller: parseFloat(amount_seller).toFixed(2),
              buyerDownloadUrl,
              isGuest,
            }
          })
        })
      }
    }

    if (stripeEvent.type === 'account.updated') {
      const account = stripeEvent.data.object
      await supabase
        .from('profiles')
        .update({
          stripe_charges_enabled: account.charges_enabled,
          stripe_payouts_enabled: account.payouts_enabled,
        })
        .eq('stripe_account_id', account.id)
    }

  } catch (err) {
    console.error(`Error processing event ${stripeEvent.id}:`, err.message)
  }

  return response
}
