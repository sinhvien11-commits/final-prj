import { useTranslation } from 'react-i18next'

const CATEGORIES = [
  { value: 'all',    key: 'all' },
  { value: 'food',   key: 'food' },
  { value: 'drinks', key: 'drinks' },
  { value: 'combo',  key: 'combo' },
]

export default function CategoryFilter({ active, onChange }) {
  const { t } = useTranslation()
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
          {t(`category.${cat.key}`)}
        </button>
      ))}
    </div>
  )
}
