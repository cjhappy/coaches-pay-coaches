export default function ErrorState({ message, onRetry, dark }) {
  return (
    <div className="cpc-card" style={{ padding: '3rem', textAlign: 'center' }}>
      <p style={{ color: dark ? '#f87171' : '#b91c1c', fontWeight: 600, fontSize: '1rem', marginBottom: onRetry ? '1rem' : 0 }}>
        {message || "Something went wrong loading this. Please try again."}
      </p>
      {onRetry && (
        <button className={dark ? 'btn btn-ghost' : 'btn btn-ghost-dark'} onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  )
}
