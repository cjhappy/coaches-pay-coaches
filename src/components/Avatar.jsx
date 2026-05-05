export default function Avatar({ url, name, size = 60, radius = 14 }) {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        style={{ width: size, height: size, borderRadius: radius, objectFit: 'cover', flexShrink: 0 }}
      />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: 'var(--green)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900,
      fontSize: size * 0.3, color: 'var(--navy)', flexShrink: 0
    }}>
      {initials}
    </div>
  )
}