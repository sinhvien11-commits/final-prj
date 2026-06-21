export default function ProgressBar({ value = 0, className = '' }) {
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div className={`h-1.5 w-full rounded-full bg-surface-container-high overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full bg-primary-fixed neon-glow transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
