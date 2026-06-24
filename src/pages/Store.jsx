import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMenu } from '../hooks/useMenu'
import { useCart } from '../context/CartContext'
import MenuCard from '../components/menu/MenuCard'
import CategoryFilter from '../components/menu/CategoryFilter'
import CartDrawer from '../components/menu/CartDrawer'
import Spinner from '../components/ui/Spinner'
import LanguageToggle from '../components/layout/LanguageToggle'
import SoundToggle from '../components/layout/SoundToggle'

export default function Store() {
  const { t } = useTranslation()
  const [category, setCategory] = useState('all')
  const { items, loading, error } = useMenu(category)
  const { addItem } = useCart()

  return (
    <div className="pt-16 pb-20 px-4 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2 py-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-display font-black text-xl uppercase tracking-tight text-primary">
            {t('store.title')}
          </h1>
          <p className="text-secondary text-xs">{t('store.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <SoundToggle />
          <LanguageToggle />
        </div>
      </div>

      <CategoryFilter active={category} onChange={setCategory} />

      {loading && <Spinner />}
      {error   && <p className="text-error text-center py-8">{t(error)}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <MenuCard key={item.id} item={item} onAdd={addItem} />
          ))}
          {items.length === 0 && (
            <p className="col-span-2 text-secondary text-center py-8">{t('store.empty')}</p>
          )}
        </div>
      )}

      <CartDrawer />
    </div>
  )
}
