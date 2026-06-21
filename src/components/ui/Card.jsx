export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-surface border border-surface-container-high rounded-xl overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
