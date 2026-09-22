// Lightweight dependency-free bar chart — groups a seller's completed
// sales into weekly buckets (last 12 weeks) and renders plain SVG bars.
// No charting library needed for something this simple, and it keeps the
// bundle small.
export default function RevenueChart({ sales }) {
  const WEEKS = 12
  const now = new Date()
  // Start of the current week (Sunday) at midnight, then walk back WEEKS-1 more weeks.
  const startOfThisWeek = new Date(now)
  startOfThisWeek.setHours(0, 0, 0, 0)
  startOfThisWeek.setDate(startOfThisWeek.getDate() - startOfThisWeek.getDay())

  const buckets = []
  for (let i = WEEKS - 1; i >= 0; i--) {
    const weekStart = new Date(startOfThisWeek)
    weekStart.setDate(weekStart.getDate() - i * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)
    buckets.push({ weekStart, weekEnd, total: 0, count: 0 })
  }

  for (const sale of sales) {
    const created = new Date(sale.created_at)
    const bucket = buckets.find(b => created >= b.weekStart && created < b.weekEnd)
    if (bucket) {
      bucket.total += Number(sale.amount_seller || 0)
      bucket.count += 1
    }
  }

  const max = Math.max(1, ...buckets.map(b => b.total))
  const width = 640
  const height = 160
  const barGap = 6
  const barWidth = (width / buckets.length) - barGap

  return (
    <div className="cpc-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <div className="section-label" style={{ marginBottom: '1rem' }}>Revenue — Last 12 Weeks</div>
      {sales.length === 0 ? (
        <p className="muted" style={{ fontSize: '.85rem' }}>No sales yet — your revenue trend will show up here once you make your first sale.</p>
      ) : (
        <svg viewBox={`0 0 ${width} ${height + 24}`} width="100%" height={height + 24} role="img" aria-label="Weekly revenue chart">
          {buckets.map((b, i) => {
            const barHeight = Math.max(2, (b.total / max) * height)
            const x = i * (barWidth + barGap)
            const y = height - barHeight
            return (
              <g key={i}>
                <title>{`Week of ${b.weekStart.toLocaleDateString()}: $${b.total.toFixed(2)} (${b.count} sale${b.count === 1 ? '' : 's'})`}</title>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="3"
                  fill={b.total > 0 ? 'var(--navy)' : 'var(--border-on-cream)'}
                />
                {i % 2 === 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={height + 16}
                    textAnchor="middle"
                    fontSize="9"
                    fill="var(--muted-on-cream)"
                  >
                    {b.weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      )}
    </div>
  )
}
