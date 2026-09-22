// Shared "nothing here yet" card with the CPC badge watermarked behind
// the message. Small, consistent brand touch in every empty state across
// the site instead of plain unbranded text.
export default function EmptyState({ message, action, cta, onAction }) {
  return (
    <div className="cpc-card" style={{ padding: '2.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <img
        src="/cpc-badge.svg"
        alt=""
        style={{
          position: 'absolute', top: '50%', left: '50%',
          width: '140px', height: '140px',
          transform: 'translate(-50%, -50%)',
          opacity: 0.05, pointerEvents: 'none'
        }}
      />
      <p className="muted" style={{ position: 'relative', marginBottom: (action || cta) ? '1rem' : 0 }}>{message}</p>
      {action}
      {cta && (
        <button className="btn btn-green" style={{ position: 'relative' }} onClick={onAction}>{cta}</button>
      )}
    </div>
  )
}
