const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

exports.handler = async (event) => {
  const sig = event.headers['stripe-signature']
  let stripeEvent

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    return { statusCode: 400, body: 'Webhook Error: ' + err.message }
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object
    const { listing_id, buyer_id, seller_id, amount_total, amount_seller, amount_platform } = session.metadata

    await supabase.from('purchases').insert({
      buyer_id,
      listing_id,
      seller_id,
      amount_total: parseFloat(amount_total),
      amount_seller: parseFloat(amount_seller),
      amount_platform: parseFloat(amount_platform),
      stripe_session_id: session.id,
      status: 'completed'
    })

    // Fetch emails and names
    const { data: listing } = await supabase
      .from('listings')
      .select('title')
      .eq('id', listing_id)
      .single()

    const { data: buyer } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', buyer_id)
      .single()

    const { data: seller } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', seller_id)
      .single()

    if (listing && buyer && seller) {
      await fetch(`${process.env.SITE_URL}/.netlify/functions/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sale',
          data: {
            sellerEmail: seller.email,
            sellerName: seller.full_name,
            buyerEmail: buyer.email,
            buyerName: buyer.full_name,
            listingTitle: listing.title,
            amountTotal: parseFloat(amount_total).toFixed(2),
            amountSeller: parseFloat(amount_seller).toFixed(2)
          }
        })
      })
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) }
}