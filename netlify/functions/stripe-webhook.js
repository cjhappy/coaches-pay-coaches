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
    console.error('Webhook signature verification failed:', err.message)
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
        // Disputes/chargebacks reference the payment_intent, not the
        // checkout session, so this is what lets the dispute handler below
        // find its way back to the right purchase row.
        stripe_payment_intent_id: session.payment_intent || null,
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
        // SITE_URL falling back here matters — without it, a missing env
        // var turns this into a fetch to "undefined/.netlify/...", which
        // throws and gets swallowed by the outer catch below with no
        // useful trace of why sale emails stopped going out.
        const siteUrl = process.env.SITE_URL || 'https://coachespaycoaches.org'
        try {
          const emailRes = await fetch(`${siteUrl}/.netlify/functions/send-email`, {
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
          if (!emailRes.ok) {
            console.error('send-email (sale) returned', emailRes.status, await emailRes.text())
          }
        } catch (emailErr) {
          console.error('send-email (sale) request failed:', emailErr.message)
        }
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

    // A dispute/chargeback previously went completely unhandled here — the
    // purchase record never reflected it and nobody was told. This finds
    // the purchase by payment_intent, flags it, and emails both the buyer's
    // seller (whose payout may get clawed back) and the platform admin.
    if (stripeEvent.type === 'charge.dispute.created') {
      const dispute = stripeEvent.data.object

      const { data: purchase } = await supabase
        .from('purchases')
        .select('id, listing_title, amount_total, seller_id')
        .eq('stripe_payment_intent_id', dispute.payment_intent)
        .maybeSingle()

      if (purchase) {
        await supabase
          .from('purchases')
          .update({ status: 'disputed', dispute_status: dispute.status, dispute_reason: dispute.reason })
          .eq('id', purchase.id)

        const { data: seller } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', purchase.seller_id)
          .single()

        if (seller) {
          await supabase.from('notifications').insert({
            user_id: purchase.seller_id,
            type: 'dispute',
            content_id: purchase.id,
            content_title: purchase.listing_title,
          })
        }

        const disputeAmount = (dispute.amount / 100).toFixed(2)
        const recipients = [process.env.ADMIN_EMAIL, seller?.email].filter(Boolean)

        const siteUrl = process.env.SITE_URL || 'https://coachespaycoaches.org'
        for (const to of recipients) {
          try {
            const emailRes = await fetch(`${siteUrl}/.netlify/functions/send-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-internal-secret': process.env.INTERNAL_FUNCTION_SECRET
              },
              body: JSON.stringify({
                type: 'dispute',
                data: {
                  to,
                  isAdmin: to === process.env.ADMIN_EMAIL,
                  sellerName: seller?.full_name || 'Seller',
                  listingTitle: purchase.listing_title || 'a listing',
                  amount: disputeAmount,
                  reason: dispute.reason,
                  purchaseId: purchase.id,
                }
              })
            })
            if (!emailRes.ok) {
              console.error('send-email (dispute) returned', emailRes.status, await emailRes.text())
            }
          } catch (emailErr) {
            console.error('send-email (dispute) request failed:', emailErr.message)
          }
        }
      } else {
        console.error(`Dispute ${dispute.id} received for unknown payment_intent ${dispute.payment_intent}`)
      }
    }

  } catch (err) {
    console.error(`Error processing event ${stripeEvent.id}:`, err.message)
  }

  return response
}
