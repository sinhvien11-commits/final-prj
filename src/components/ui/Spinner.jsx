export default function Spinner({ className = '' }) {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <div className="w-8 h-8 rounded-full border-2 border-surface-container-high border-t-primary-fixed animate-spin" />
    </div>
  )
}
