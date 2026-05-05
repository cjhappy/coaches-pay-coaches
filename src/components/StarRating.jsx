export default function StarRating({ rating, size = 18, interactive = false, onRate }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={() => interactive && onRate && onRate(star)}
          style={{
            fontSize: size,
            color: star <= rating ? '#f59e0b' : 'var(--border)',
            cursor: interactive ? 'pointer' : 'default',
            transition: 'color .15s'
          }}
        >
          ★
        </span>
      ))}
    </div>
  )
}