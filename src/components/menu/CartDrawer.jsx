import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { db } from '../../lib/firebase'
import { useCart } from '../../context/CartContext'
import Button from '../ui/Button'

export default function CartDrawer() {
  const { items, total, machineNo, clearCart, removeItem, addItem } = useCart()
  const [open, setOpen]     = useState(false)
  const [note, setNote]     = useState('')
  const [placing, setPlacing] = useState(false)

  const count = items.reduce((sum, i) => sum + i.qty, 0)

  async function handlePlaceOrder() {
    if (!items.length) return
    setPlacing(true)
    try {
      await addDoc(collection(db, 'orders'), {
        machineNo:  Number(machineNo),
        items:      items.map((i) => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
        total,
        status:     'received',
        waitMin:    0,
        note:       note.trim(),
        createdAt:  serverTimestamp(),
        updatedAt:  serverTimestamp(),
      })
      toast.success('Đặt hàng thành công!')
      clearCart()
      setNote('')
      setOpen(false)
    } catch (err) {
      toast.error('Không thể đặt hàng. Vui lòng thử lại.')
      console.error(err)
    } finally {
      setPlacing(false)
    }
  }

  if (!count) return null

  return (
    <>
      {/* Floating cart button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-40 bg-primary-fixed text-black rounded-full px-4 py-2.5 flex items-center gap-2 neon-glow font-bold text-xs uppercase"
      >
        <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
        {count} món · {total.toLocaleString('vi-VN')} đ
      </button>

      {/* Backdrop */}
      {open && <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setOpen(false)} />}

      {/* Drawer */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 max-w-[480px] mx-auto bg-surface rounded-t-2xl border border-surface-container-high transition-transform duration-300 ${open ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-container-high">
          <h3 className="font-display font-bold uppercase text-primary text-sm tracking-tight">Giỏ hàng</h3>
          <button onClick={() => setOpen(false)}>
            <span className="material-symbols-outlined text-secondary">close</span>
          </button>
        </div>

        <div className="px-5 py-3 max-h-64 overflow-y-auto flex flex-col gap-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3">
              <span className="text-on-surface text-sm flex-1 truncate">{item.name}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => removeItem(item.id)} className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px] text-secondary">remove</span>
                </button>
                <span className="text-primary font-bold text-sm w-4 text-center">{item.qty}</span>
                <button onClick={() => addItem(item)} className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px] text-secondary">add</span>
                </button>
                <span className="text-secondary text-xs w-20 text-right">
                  {(item.price * item.qty).toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 pb-5 flex flex-col gap-3 border-t border-surface-container-high pt-3">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ghi chú (không bắt buộc)"
            className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary-fixed"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondary">Tổng cộng</span>
            <span className="text-primary font-bold">{total.toLocaleString('vi-VN')} đ</span>
          </div>
          <Button onClick={handlePlaceOrder} disabled={placing}>
            {placing ? 'ĐANG ĐẶT...' : 'ĐẶT NGAY'}
          </Button>
        </div>
      </div>
    </>
  )
}
