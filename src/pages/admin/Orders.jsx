import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, runTransaction } from 'firebase/firestore'
import { serverTimestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { db } from '../../lib/firebase'
import { useNewOrderAlert } from '../../hooks/useNewOrderAlert'

const COLUMNS = [
  { status: 'received',   label: 'RECEIVED',   color: 'text-secondary' },
  { status: 'preparing',  label: 'PREPARING',  color: 'text-primary-fixed' },
  { status: 'delivering', label: 'DELIVERING', color: 'text-primary-fixed' },
]

const NEXT_STATUS = {
  received:   'preparing',
  preparing:  'delivering',
  delivering: 'done',
}

const WAIT_OPTIONS = [5, 10, 15, 20]

export default function AdminOrders() {
  const navigate = useNavigate()
  const [allOrders, setAllOrders] = useState([])
  const [waitInputs, setWaitInputs] = useState({})

  useEffect(() => {
    const q = query(
      collection(db, 'orders'),
      where('status', 'in', ['received', 'preparing', 'delivering']),
      orderBy('createdAt', 'asc')
    )
    const unsub = onSnapshot(q,
      (snap) => setAllOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => { toast.error('Không thể tải đơn hàng.'); console.error(err) }
    )
    return unsub
  }, [])

  const receivedOrders = allOrders.filter((o) => o.status === 'received')
  useNewOrderAlert(receivedOrders)

  async function advanceStatus(order) {
    const next = NEXT_STATUS[order.status]
    if (!next) return
    try {
      if (next === 'done') {
        await completeOrder(order)
      } else {
        const update = { status: next, updatedAt: serverTimestamp() }
        if (order.status === 'received') {
          update.waitMin = Number(waitInputs[order.id] ?? 15)
        }
        await updateDoc(doc(db, 'orders', order.id), update)
      }
    } catch (err) {
      toast.error('Không thể cập nhật đơn hàng.')
      console.error(err)
    }
  }

  // Hoàn tất đơn + cộng floor(total/1000) điểm cho máy, trong 1 transaction.
  // Cờ pointsAwarded đảm bảo không cộng trùng nếu bấm "Đã giao xong" nhiều lần.
  async function completeOrder(order) {
    const orderRef  = doc(db, 'orders', order.id)
    const pointsRef = doc(db, 'points', String(order.machineNo))
    await runTransaction(db, async (tx) => {
      const orderSnap = await tx.get(orderRef)
      if (!orderSnap.exists()) return
      const o = orderSnap.data()
      if (o.status === 'done' && o.pointsAwarded) return // đã cộng rồi
      const pointsSnap = await tx.get(pointsRef)
      const earned = Math.floor((o.total ?? 0) / 1000)
      const base   = pointsSnap.exists() ? pointsSnap.data().balance : 100 // 100 = thưởng chào mừng lần đầu
      tx.set(pointsRef, { balance: base + earned, updatedAt: serverTimestamp() }, { merge: true })
      tx.update(orderRef, { status: 'done', updatedAt: serverTimestamp(), pointsAwarded: true })
    })
  }

  async function cancelOrder(order) {
    if (!confirm(`Hủy đơn máy ${order.machineNo}?`)) return
    try {
      await updateDoc(doc(db, 'orders', order.id), { status: 'cancelled', updatedAt: serverTimestamp() })
    } catch (err) {
      toast.error('Không thể hủy đơn hàng.')
      console.error(err)
    }
  }

  const byStatus = (status) => allOrders.filter((o) => o.status === status)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-2xl uppercase tracking-tight text-primary">
            Kitchen Board
          </h1>
          <p className="text-secondary text-sm mt-1">{allOrders.length} đơn đang xử lý</p>
        </div>
        <button
          onClick={() => navigate('/admin/requests')}
          className="flex items-center gap-1 bg-surface-container text-primary text-sm font-bold px-4 py-2 rounded-lg hover:bg-surface-variant transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">room_service</span>
          Yêu cầu phục vụ
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {COLUMNS.map(({ status, label, color }) => (
          <div key={status} className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <h2 className={`font-display font-bold text-sm uppercase tracking-wider ${color}`}>
                {label}
              </h2>
              <span className="bg-surface-container text-secondary text-xs font-bold px-2 py-0.5 rounded-full">
                {byStatus(status).length}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {byStatus(status).map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  waitValue={waitInputs[order.id] ?? 15}
                  onWaitChange={(v) => setWaitInputs((p) => ({ ...p, [order.id]: v }))}
                  onAdvance={() => advanceStatus(order)}
                  onCancel={() => cancelOrder(order)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function OrderCard({ order, waitValue, onWaitChange, onAdvance, onCancel }) {
  const elapsed = order.createdAt?.toDate
    ? Math.round((Date.now() - order.createdAt.toDate().getTime()) / 60000)
    : 0

  return (
    <div className="bg-surface border border-surface-container-high rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-primary font-bold text-sm">Máy {order.machineNo}</span>
        <span className="text-secondary text-xs">{elapsed} phút trước</span>
      </div>

      <div className="flex flex-col gap-1">
        {order.items.map((item, idx) => (
          <p key={idx} className="text-secondary text-xs">{item.qty}× {item.name}</p>
        ))}
      </div>

      {order.note && (
        <p className="text-xs text-on-surface-variant italic border-t border-surface-container-high pt-2">
          {order.note}
        </p>
      )}

      {order.status === 'received' && (
        <div className="flex gap-1">
          {[5, 10, 15, 20].map((min) => (
            <button
              key={min}
              onClick={() => onWaitChange(min)}
              className={`flex-1 text-xs py-1 rounded-lg font-bold transition-colors ${waitValue === min ? 'bg-primary-fixed text-black' : 'bg-surface-container text-secondary'}`}
            >
              {min}p
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-1 border-t border-surface-container-high">
        {NEXT_STATUS[order.status] && (
          <button
            onClick={onAdvance}
            className="flex-1 bg-primary-fixed text-black text-xs font-bold uppercase py-2 rounded-lg hover:bg-primary-fixed-dim transition-colors"
          >
            {order.status === 'received'  && 'Bắt đầu làm'}
            {order.status === 'preparing' && 'Bắt đầu giao'}
            {order.status === 'delivering'&& 'Đã giao xong'}
          </button>
        )}
        {['received', 'preparing'].includes(order.status) && (
          <button
            onClick={onCancel}
            className="px-3 bg-surface-container text-error text-xs font-bold uppercase py-2 rounded-lg hover:bg-surface-variant transition-colors"
          >
            Hủy
          </button>
        )}
      </div>
    </div>
  )
}
