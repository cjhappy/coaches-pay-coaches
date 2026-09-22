const { createClient } = require('@supabase/supabase-js')

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const SITE_URL = process.env.SITE_URL || 'https://coachespaycoaches.org'

// The old public/sitemap.xml only listed static pages — every listing and
// coach profile (the pages people actually search Google for, like "3v3
// blueprint basketball") was invisible to search engines. This generates
// the sitemap live from the database on every request instead.
//
// Netlify caches this response at the edge per its Cache-Control header,
// so it's not hit on every crawl — just refreshed periodically.
exports.handler = async () => {
  const staticUrls = [
    { loc: '/', changefreq: 'weekly', priority: '1.0' },
    { loc: '/marketplace', changefreq: 'daily', priority: '0.9' },
    { loc: '/coaches', changefreq: 'daily', priority: '0.8' },
    { loc: '/feed', changefreq: 'daily', priority: '0.7' },
    { loc: '/auth', changefreq: 'monthly', priority: '0.6' },
    { loc: '/terms', changefreq: 'yearly', priority: '0.3' },
    { loc: '/privacy', changefreq: 'yearly', priority: '0.3' },
    { loc: '/refunds', changefreq: 'yearly', priority: '0.3' },
  ]

  let listingUrls = []
  let coachUrls = []

  try {
    const { data: listings } = await supabaseAdmin
      .from('listings')
      .select('id, updated_at, created_at')
      .order('created_at', { ascending: false })
      .limit(5000)

    listingUrls = (listings || []).map(l => ({
      loc: `/listing/${l.id}`,
      lastmod: (l.updated_at || l.created_at)?.slice(0, 10),
      changefreq: 'weekly',
      priority: '0.7',
    }))

    const { data: coaches } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .or('role.eq.seller,role.eq.both')
      .limit(5000)

    coachUrls = (coaches || []).map(c => ({
      loc: `/coach/${c.id}`,
      changefreq: 'weekly',
      priority: '0.5',
    }))
  } catch (err) {
    console.error('Sitemap generation failed to fetch listings/coaches:', err.message)
    // Fall through and still serve the static pages rather than a 500 —
    // a partial sitemap beats no sitemap.
  }

  const allUrls = [...staticUrls, ...listingUrls, ...coachUrls]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${SITE_URL}${u.loc}</loc>
${u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : ''}    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
    body: xml,
  }
}
