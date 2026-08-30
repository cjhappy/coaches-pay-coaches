import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { compressImage } from '../lib/imageCompress'

const SPORTS = ['Basketball', 'Soccer', 'Football', 'Baseball', 'Softball', 'Hockey', 'Volleyball', 'Lacrosse', 'Tennis', 'Track & Field', 'Swimming', 'Wrestling', 'Golf', 'Gymnastics', 'Cheerleading', 'Dance', 'Cross Country', 'Rugby', 'Field Hockey', 'Water Polo', 'Bowling', 'Cycling', 'Rowing', 'Fencing', 'Skiing', 'Snowboarding', 'Martial Arts', 'Boxing', 'Multi-Sport', 'Other']
const CATEGORIES = ['Practice Plans', 'Drills & Workouts', 'Playbooks', 'Season Plans', 'Scouting Reports', 'Film Breakdown', 'Nutrition Plans', 'Meal Prep Guides', 'Mental Performance', 'Injury Prevention', 'Recovery Protocols', 'Speed & Agility Programs', 'Strength Programs', 'Recruiting Guides', 'Academic Resources', 'Parent Resources', 'Leadership Development', 'Other']

const TITLE_LIMIT = 100
const DESCRIPTION_LIMIT = 1000
const THUMBNAIL_MAX_MB = 5
const FILE_MAX_MB = 100
const BLOCKED_EXTENSIONS = ['exe', 'bat', 'cmd', 'sh', 'app', 'msi', 'scr', 'com', 'vbs', 'js', 'jar', 'apk', 'dmg']

export default function ListingForm({ listing, onSave, onCancel }) {
  const { user } = useAuth()
  const [title, setTitle] = useState(listing?.title || '')
  const [description, setDescription] = useState(listing?.description || '')
  const [price, setPrice] = useState(listing?.price ?? '')
  const [sport, setSport] = useState(listing?.sport || '')
  const [category, setCategory] = useState(listing?.category || '')
  const [file, setFile] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function validatePrice(val) {
    const num = parseFloat(val)
    if (isNaN(num)) return 'Please enter a valid price.'
    if (num > 0 && num < 3) return 'Paid listings must be at least $3.00. Set price to $0 to list for free.'
    return null
  }

  async function handleThumbnailChange(e) {
    const f = e.target.files[0]
    if (!f) return
    if (!f.type.startsWith('image/')) {
      setError('Thumbnail must be an image file.')
      e.target.value = ''
      return
    }
    if (f.size > THUMBNAIL_MAX_MB * 1024 * 1024) {
      setError(`Thumbnail must be under ${THUMBNAIL_MAX_MB}MB.`)
      e.target.value = ''
      return
    }
    setError(null)
    const compressed = await compressImage(f, { maxDimension: 800, quality: 0.82 })
    setThumbnail(compressed)
  }

  function handleFileChange(e) {
    const f = e.target.files[0]
    if (!f) return
    const ext = f.name.split('.').pop().toLowerCase()
    if (BLOCKED_EXTENSIONS.includes(ext)) {
      setError('That file type is not allowed for security reasons. Upload a document, PDF, image, video, or archive instead.')
      e.target.value = ''
      return
    }
    if (f.size > FILE_MAX_MB * 1024 * 1024) {
      setError(`File must be under ${FILE_MAX_MB}MB.`)
      e.target.value = ''
      return
    }
    setError(null)
    setFile(f)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    const priceError = validatePrice(price)
    if (priceError) { setError(priceError); return }

    setLoading(true)

    try {
      let file_url = listing?.file_url || ''
      let file_name = listing?.file_name || ''
      let thumbnail_url = listing?.thumbnail_url || null

      if (file) {
        const ext = file.name.split('.').pop()
        const path = `${user.id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('listings-files')
          .upload(path, file)
        if (uploadError) throw uploadError
        file_url = path
        file_name = file.name
      }

      if (thumbnail) {
        const ext = thumbnail.name.split('.').pop()
        const path = `${user.id}/${Date.now()}.${ext}`
        const { error: thumbError } = await supabase.storage
          .from('listings-thumbnails')
          .upload(path, thumbnail)
        if (thumbError) throw thumbError
        const { data: { publicUrl } } = supabase.storage
          .from('listings-thumbnails')
          .getPublicUrl(path)
        thumbnail_url = publicUrl
      }

      const payload = {
        seller_id: user.id,
        title,
        description,
        price: parseFloat(price) || 0,
        sport,
        category,
        file_url,
        file_name,
        thumbnail_url,
        updated_at: new Date().toISOString()
      }

      if (listing?.id) {
        const { error: updateError } = await supabase
          .from('listings')
          .update(payload)
          .eq('id', listing.id)
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('listings')
          .insert(payload)
        if (insertError) throw insertError
      }

      onSave()
    } catch (err) {
      setError(err.message)
    }

    setLoading(false)
  }

  const priceNum = parseFloat(price)
  const priceInvalid = priceNum > 0 && priceNum < 3

  return (
    <div className="cpc-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
      <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 900, fontSize: '1.3rem', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
        {listing ? 'Edit Listing' : 'New Listing'}
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Title *</label>
            <input className="form-input" value={title} onChange={e => setTitle(e.target.value.slice(0, TITLE_LIMIT))} maxLength={TITLE_LIMIT} placeholder="e.g. Motion Offense System for Youth Basketball" required />
            <p className="muted" style={{ fontSize: '.75rem', marginTop: '4px' }}>{title.length}/{TITLE_LIMIT}</p>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Description *</label>
            <textarea className="form-input" value={description} onChange={e => setDescription(e.target.value.slice(0, DESCRIPTION_LIMIT))} maxLength={DESCRIPTION_LIMIT} placeholder="Describe what coaches get from this resource..." required rows={4} style={{ resize: 'vertical' }} />
            <p className="muted" style={{ fontSize: '.75rem', marginTop: '4px' }}>{description.length}/{DESCRIPTION_LIMIT}</p>
          </div>

          <div>
            <label className="form-label">Sport *</label>
            <select className="form-input" value={sport} onChange={e => setSport(e.target.value)} required>
              <option value="">Select a sport</option>
              {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="form-label">Category *</label>
            <select className="form-input" value={category} onChange={e => setCategory(e.target.value)} required>
              <option value="">Select a category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="form-label">Price (USD)</label>
            <input
              className="form-input"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="0.00"
              required
              style={{ borderColor: priceInvalid ? '#b91c1c' : undefined }}
            />
            {priceInvalid ? (
              <p style={{ color: '#b91c1c', fontSize: '.78rem', marginTop: '4px' }}>
                Paid listings must be at least $3.00. Set to $0 to list for free.
              </p>
            ) : (
              <p style={{ color: 'var(--muted-on-cream)', fontSize: '.78rem', marginTop: '4px' }}>
                Enter $0 for a free listing, or $3.00 minimum for paid.
              </p>
            )}
          </div>

          <div>
            <label className="form-label">Thumbnail Image (optional)</label>
            <input className="form-input" type="file" accept="image/*" onChange={handleThumbnailChange} />
            <p className="muted" style={{ fontSize: '.75rem', marginTop: '4px' }}>Up to {THUMBNAIL_MAX_MB}MB</p>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Resource File * {listing && '(leave empty to keep current file)'}</label>
            <input className="form-input" type="file" onChange={handleFileChange} required={!listing} />
            <p className="muted" style={{ fontSize: '.75rem', marginTop: '4px' }}>Up to {FILE_MAX_MB}MB — documents, PDFs, images, videos, and archives only</p>
            {listing?.file_name && <p style={{ color: 'var(--muted-on-cream)', fontSize: '.8rem', marginTop: '4px' }}>Current: {listing.file_name}</p>}
          </div>

        </div>

        {error && <p className="auth-error">{error}</p>}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button type="submit" className="btn btn-green" disabled={loading || priceInvalid}>
            {loading ? 'Saving...' : listing ? 'Save Changes →' : 'Publish Listing →'}
          </button>
          <button type="button" className="btn btn-ghost-dark" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  )
}