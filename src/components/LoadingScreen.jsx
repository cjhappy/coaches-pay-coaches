// Branded loading state shown during route transitions (lazy-loaded pages)
// and while the session/profile is being resolved on protected routes.
// `fullPage` centers it in the viewport; pass false to drop it inline
// inside a container that already has its own layout.
export default function LoadingScreen({ fullPage = true, label = 'Loading' }) {
  const content = (
    <div className="cpc-loading">
      <div className="cpc-loading-ring">
        <img src="/cpc-badge.svg" alt="" className="cpc-loading-badge" />
      </div>
      <div className="cpc-loading-label">{label}</div>
    </div>
  )

  if (!fullPage) return content
  return <div className="cpc-loading-page">{content}</div>
}
