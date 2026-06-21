import { useState } from 'react'
import { useMenu } from '../hooks/useMenu'
import { useCart } from '../context/CartContext'
import MenuCard from '../components/menu/MenuCard'
import CategoryFilter from '../components/menu/CategoryFilter'
import CartDrawer from '../components/menu/CartDrawer'
import Spinner from '../components/ui/Spinner'

export default function Store() {
  const [category, setCategory] = useState('all')
  const { items, loading, error } = useMenu(category)
  const { addItem } = useCart()

  return (
    <div className="pt-16 pb-20 px-4 flex flex-col gap-4">
      <div className="flex flex-col gap-1 py-3">
        <h1 className="font-display font-black text-xl uppercase tracking-tight text-primary">
          Menu
        </h1>
        <p className="text-secondary text-xs">Chọn món — giao tận bàn</p>
      </div>

      <CategoryFilter active={category} onChange={setCategory} />

      {loading && <Spinner />}
      {error   && <p className="text-error text-center py-8">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <MenuCard key={item.id} item={item} onAdd={addItem} />
          ))}
          {items.length === 0 && (
            <p className="col-span-2 text-secondary text-center py-8">Không có món nào.</p>
          )}
        </div>
      )}

      <CartDrawer />
    </div>
  )
}
