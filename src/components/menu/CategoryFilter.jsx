const CATEGORIES = [
  { value: 'all',    label: 'Tất cả' },
  { value: 'food',   label: 'Đồ ăn' },
  { value: 'drinks', label: 'Nước' },
  { value: 'combo',  label: 'Combo' },
]

export default function CategoryFilter({ active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
            active === cat.value
              ? 'bg-primary-fixed text-black'
              : 'bg-surface-container text-secondary hover:bg-surface-variant'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
