export default function Badge({ children, variant = 'default', className = '' }) {
  if (variant === 'live') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-surface-container text-primary-fixed ${className}`}>
        <span className="w-2 h-2 rounded-full bg-primary-fixed animate-pulse" />
        {children}
      </span>
    )
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-surface-container text-on-surface ${className}`}>
      {children}
    </span>
  )
}
