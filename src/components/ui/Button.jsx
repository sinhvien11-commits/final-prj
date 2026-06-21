export default function Button({ children, variant = 'primary', className = '', disabled, ...props }) {
  const base = 'font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-colors disabled:opacity-40 disabled:pointer-events-none'
  const variants = {
    primary:   'w-full bg-primary-fixed text-black neon-glow hover:bg-primary-fixed-dim',
    secondary: 'w-full bg-surface-container text-on-surface border border-surface-container-high hover:bg-surface-variant',
    ghost:     'w-full border border-surface-container-high text-on-surface hover:bg-surface-container',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} disabled={disabled} {...props}>
      {children}
    </button>
  )
}
