// Injects real per-page title/description/og:image into the HTML <head>
// for listing and coach pages — but only for crawlers (search engines,
// link-preview bots), not real visitors.
//
// Why: the site is a client-rendered React app, so every page ships the
// same static index.html with the homepage's meta tags. A human visiting
// /listing/abc123 sees the right content once React mounts and updates
// the <head> via react-helmet-async — but crawlers for Google, iMessage,
// Twitter, Slack, etc. generally don't execute JS and only ever see the
// homepage's title/description/image, however deep the URL. That means
// every shared listing link previews as generic "Coaches Pay Coaches"
// branding instead of the actual drill/playbook, and search results can't
// show listing-specific snippets.
//
// This edge function runs before the static file is served. For a normal
// browser it just passes the request straight through untouched. For a
// recognized bot, it fetches the real listing/coach row from Supabase and
// rewrites the handful of meta tags in the HTML before returning it —
// the visible app is unaffected either way.

const BOT_PATTERN = /bot|crawl|spider|facebookexternalhit|slackbot|twitterbot|linkedinbot|whatsapp|telegrambot|discordbot|pinterest|redditbot|embedly|quora link preview|w3c_validator|google-inspectiontool|bingpreview/i

const SITE_URL = 'https://coachespaycoaches.org'
const FALLBACK_IMAGE = `${SITE_URL}/og-image.png`

export default async (request, context) => {
  const userAgent = request.headers.get('user-agent') || ''
  const response = await context.next()

  if (!BOT_PATTERN.test(userAgent)) {
    // Real visitor — serve the normal SPA untouched.
    return response
  }

  const url = new URL(request.url)
  const listingMatch = url.pathname.match(/^\/listing\/([^/]+)/)
  const coachMatch = url.pathname.match(/^\/coach\/([^/]+)/)

  let meta = null
  try {
    if (listingMatch) {
      meta = await fetchListingMeta(listingMatch[1])
    } else if (coachMatch) {
      meta = await fetchCoachMeta(coachMatch[1])
    }
  } catch (err) {
    console.error('social-meta: fetch failed:', err.message)
  }

  if (!meta) {
    // No matching row, or the lookup failed — fall back to the default
    // page rather than risk serving a broken response to a crawler.
    return response
  }

  let html = await response.text()
  html = applyMeta(html, meta, url.href)

  return new Response(html, {
    status: response.status,
    headers: response.headers,
  })
}

async function fetchListingMeta(id) {
  const row = await supabaseGet(`listings?id=eq.${id}&select=title,description,thumbnail_url,price&limit=1`)
  if (!row || !row[0]) return null
  const listing = row[0]
  const price = listing.price === 0 ? 'Free' : `$${Number(listing.price).toFixed(2)}`
  return {
    title: `${listing.title} — Coaches Pay Coaches`,
    description: (listing.description || '').slice(0, 200) || `${price} coaching resource on Coaches Pay Coaches.`,
    image: listing.thumbnail_url || FALLBACK_IMAGE,
  }
}

async function fetchCoachMeta(id) {
  const row = await supabaseGet(`profiles?id=eq.${id}&select=full_name,bio,avatar_url&limit=1`)
  if (!row || !row[0]) return null
  const coach = row[0]
  return {
    title: `${coach.full_name} — Coaches Pay Coaches`,
    description: (coach.bio || '').slice(0, 200) || `Browse coaching resources from ${coach.full_name} on Coaches Pay Coaches.`,
    image: coach.avatar_url || FALLBACK_IMAGE,
  }
}

async function supabaseGet(query) {
  const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL')
  const anonKey = Deno.env.get('VITE_SUPABASE_ANON_KEY')
  if (!supabaseUrl || !anonKey) return null

  const res = await fetch(`${supabaseUrl}/rest/v1/${query}`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  })
  if (!res.ok) return null
  return res.json()
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function applyMeta(html, meta, canonicalUrl) {
  const title = escapeHtml(meta.title)
  const description = escapeHtml(meta.description)
  const image = escapeHtml(meta.image)

  html = html.replace(/<title>.*?<\/title>/s, `<title>${title}</title>`)
  html = html.replace(/(<meta name="description" content=")[^"]*(")/, `$1${description}$2`)
  html = html.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`)
  html = html.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${description}$2`)
  html = html.replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${image}$2`)
  html = html.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${escapeHtml(canonicalUrl)}$2`)
  html = html.replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`)
  html = html.replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${description}$2`)
  html = html.replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${image}$2`)
  html = html.replace(/(<meta name="twitter:url" content=")[^"]*(")/, `$1${escapeHtml(canonicalUrl)}$2`)
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${escapeHtml(canonicalUrl)}$2`)

  return html
}
