import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { compressImage } from '../lib/imageCompress'

const BANNER_COLORS = [
  { name: 'Navy (default)', value: null },
  { name: 'Forest', value: '#1a4d3e' },
  { name: 'Maroon', value: '#5c1a2b' },
  { name: 'Slate', value: '#2b3a4a' },
  { name: 'Purple', value: '#3a2b5c' },
  { name: 'Burnt Orange', value: '#6b3410' },
]

const TAGLINE_LIMIT = 80

// Lets a coach customize their own storefront (CoachProfile.jsx) beyond
// the plain bio — a banner accent, a one-line tagline, social links, and
// which of their own listings to feature at the top of their grid.
export default function StorefrontEditor({ profile, listings, setProfile }) {
  const [tagline, setTagline] = useState(profile?.tagline || '')
  const [instagramUrl, setInstagramUrl] = useState(profile?.instagram_url || '')
  const [twitterUrl, setTwitterUrl] = useState(profile?.twitter_url || '')
  const [websiteUrl, setWebsiteUrl] = useState(profile?.website_url || '')
  const [bannerColor, setBannerColor] = useState(profile?.banner_color || null)
  const [bannerUrl, setBannerUrl] = useState(profile?.banner_url || null)
  const [featuredIds, setFeaturedIds] = useState(profile?.featured_listing_ids || [])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  async function handleBannerUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setError(null)
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.')
      e.target.value = ''
      return
    }
    setUploading(true)
    try {
      // Reuses the existing 'avatars' bucket (already scoped to
      // ${profile.id}/... by its storage policy) rather than requiring a
      // brand new bucket + RLS setup just for banners.
      const compressed = await compressImage(file, { maxDimension: 1600, quality: 0.85 })
      const ext = compressed.name.split('.').pop()
      const path = `${profile.id}/banner.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, compressed, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      const bustUrl = publicUrl + '?t=' + Date.now()
      setBannerUrl(bustUrl)
    } catch (err) {
      setError('Banner upload failed. Please try again.')
    }
    setUploading(false)
  }

  function toggleFeatured(id) {
    setFeaturedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    const payload = {
      tagline: tagline.trim() || null,
      instagram_url: instagramUrl.trim() || null,
      twitter_url: twitterUrl.trim() || null,
      website_url: websiteUrl.trim() || null,
      banner_color: bannerColor,
      banner_url: bannerUrl,
      featured_listing_ids: featuredIds,
    }
    const { error: updateError } = await supabase.from('profiles').update(payload).eq('id', profile.id)
    setSaving(false)
    if (updateError) {
      setError('Could not save — please try again.')
    } else {
      setProfile(prev => ({ ...prev, ...payload }))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <div className="cpc-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
      <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', color: 'var(--navy)', marginBottom: '1rem' }}>
        Customize Your Storefront
      </div>

      <label className="form-label">Tagline</label>
      <input
        className="form-input"
        value={tagline}
        onChange={e => setTagline(e.target.value.slice(0, TAGLINE_LIMIT))}
        placeholder="e.g. Youth basketball skills coach, 10 years"
        maxLength={TAGLINE_LIMIT}
        style={{ marginBottom: '.4rem' }}
      />
      <div className="muted" style={{ fontSize: '.72rem', marginBottom: '1rem' }}>{tagline.length}/{TAGLINE_LIMIT} — shown under your name, above your bio</div>

      <label className="form-label">Banner Color</label>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {BANNER_COLORS.map(c => (
          <button
            key={c.name}
            type="button"
            onClick={() => setBannerColor(c.value)}
            title={c.name}
            style={{
              width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer',
              background: c.value || 'var(--navy)',
              border: bannerColor === c.value ? '3px solid var(--yellow)' : '2px solid var(--border-on-cream)',
            }}
          />
        ))}
      </div>

      <label className="form-label">Banner Image (optional)</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        {bannerUrl && (
          <img src={bannerUrl} alt="" style={{ width: '80px', height: '44px', objectFit: 'cover', borderRadius: '6px' }} />
        )}
        <label style={{ cursor: 'pointer' }}>
          <span className="btn btn-ghost-dark" style={{ padding: '8px 16px', fontSize: '12px', pointerEvents: 'none' }}>
            {uploading ? 'Uploading...' : bannerUrl ? 'Replace Image' : 'Upload Image'}
          </span>
          <input type="file" accept="image/*" onChange={handleBannerUpload} style={{ display: 'none' }} />
        </label>
        {bannerUrl && (
          <button type="button" className="btn btn-ghost-dark" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={() => setBannerUrl(null)}>
            Remove
          </button>
        )}
      </div>
      <div className="muted" style={{ fontSize: '.72rem', marginBottom: '1rem' }}>If set, this replaces the banner color on your storefront.</div>

      <label className="form-label">Social &amp; Website Links</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', marginBottom: '1rem' }}>
        <input className="form-input" value={instagramUrl} onChange={e => setInstagramUrl(e.target.value)} placeholder="Instagram URL" />
        <input className="form-input" value={twitterUrl} onChange={e => setTwitterUrl(e.target.value)} placeholder="X / Twitter URL" />
        <input className="form-input" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="Website URL" />
      </div>

      {listings.length > 0 && (
        <>
          <label className="form-label">Featured Listings (up to 3)</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem', marginBottom: '1rem' }}>
            {listings.map(l => (
              <label key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '.85rem', color: 'var(--navy)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={featuredIds.includes(l.id)}
                  onChange={() => toggleFeatured(l.id)}
                  disabled={!featuredIds.includes(l.id) && featuredIds.length >= 3}
                />
                {l.title}
              </label>
            ))}
          </div>
        </>
      )}

      {error && <p className="auth-error" style={{ marginBottom: '.75rem' }}>{error}</p>}

      <button className="btn btn-green" style={{ padding: '8px 20px', fontSize: '13px' }} onClick={handleSave} disabled={saving || uploading}>
        {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Storefront'}
      </button>
    </div>
  )
}
