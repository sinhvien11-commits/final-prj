import { useTranslation } from 'react-i18next'
import { itemName } from '../../lib/itemName'

export default function MenuCard({ item, onAdd }) {
  const { t, i18n } = useTranslation()
  const formatted = item.price.toLocaleString('vi-VN') + ' đ'
  const displayName = itemName(item, i18n.language)

  return (
    <article className={`bg-surface border border-surface-container-high rounded-xl overflow-hidden${!item.inStock ? ' opacity-50 grayscale pointer-events-none' : ''}`}>
      <div className="relative aspect-video bg-surface-container">
        {item.imageUrl
          ? <img src={item.imageUrl} alt={displayName} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-secondary">fastfood</span>
            </div>
        }
        {!item.inStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-black/70 text-secondary text-xs font-bold uppercase px-3 py-1 rounded-full">{t('menuCard.outOfStock')}</span>
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col gap-2">
        <div>
          <p className="text-primary font-bold text-sm leading-tight">{displayName}</p>
          <p className="text-secondary text-xs mt-0.5 flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">timer</span>
            {t('menuCard.prep', { min: item.prepMin })}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-primary-fixed font-bold text-sm">{formatted}</span>
          <button
            onClick={() => onAdd(item)}
            disabled={!item.inStock}
            aria-label={t('menuCard.add')}
            className="w-7 h-7 rounded-full bg-primary-fixed text-black flex items-center justify-center hover:bg-primary-fixed-dim transition-colors disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
          </button>
        </div>
      </div>
    </article>
  )
}
