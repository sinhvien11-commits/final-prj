import { createContext, useContext, useState, useCallback } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems]       = useState([])
  const [machineNo, setMachineNo] = useState(() => localStorage.getItem('machineNo') ?? '')

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0)

  const addItem = useCallback((menuItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === menuItem.id)
      if (existing) {
        return prev.map((i) => i.id === menuItem.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { id: menuItem.id, name: menuItem.name, price: menuItem.price, qty: 1 }]
    })
  }, [])

  const removeItem = useCallback((id) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id)
      if (!existing) return prev
      if (existing.qty === 1) return prev.filter((i) => i.id !== id)
      return prev.map((i) => i.id === id ? { ...i, qty: i.qty - 1 } : i)
    })
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const saveMachineNo = useCallback((num) => {
    localStorage.setItem('machineNo', String(num))
    setMachineNo(String(num))
  }, [])

  return (
    <CartContext.Provider value={{ items, total, machineNo, addItem, removeItem, clearCart, saveMachineNo }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
