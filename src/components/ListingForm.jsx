import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const SPORTS = ['Basketball', 'Soccer', 'Football', 'Baseball', 'Hockey', 'Volleyball', 'Lacrosse', 'Tennis', 'Track & Field', 'Swimming', 'Multi-Sport', 'Other']
const CATEGORIES = ['Practice Plans', 'Drills', 'Playbooks', 'Season Plans', 'Scouting Reports', 'Strength & Conditioning', 'Film Breakdown', 'Recruiting', 'Mental Performance', 'Other']

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

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
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

  return (
    <div className="cpc-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
      <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '1.3rem', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
        {listing ? 'Edit Listing' : 'New Listing'}
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Title *</label>
            <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Motion Offense System for Youth Basketball" required />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Description *</label>
            <textarea className="form-input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe what coaches get from this resource..." required rows={4} style={{ resize: 'vertical' }} />
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
            <label className="form-label">Price (USD) — enter 0 for free</label>
            <input className="form-input" type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" required />
          </div>

          <div>
            <label className="form-label">Thumbnail Image (optional)</label>
            <input className="form-input" type="file" accept="image/*" onChange={e => setThumbnail(e.target.files[0])} />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Resource File * {listing && '(leave empty to keep current file)'}</label>
            <input className="form-input" type="file" onChange={e => setFile(e.target.files[0])} required={!listing} />
            {listing?.file_name && <p style={{ color: 'var(--muted)', fontSize: '.8rem', marginTop: '4px' }}>Current: {listing.file_name}</p>}
          </div>

        </div>

        {error && <p className="auth-error">{error}</p>}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button type="submit" className="btn btn-green" disabled={loading}>
            {loading ? 'Saving...' : listing ? 'Save Changes →' : 'Publish Listing →'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  )
}