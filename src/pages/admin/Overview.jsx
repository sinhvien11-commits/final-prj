import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, onSnapshot, where, Timestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import Spinner from '../../components/ui/Spinner'

function KpiCard({ icon, label, value, sub }) {
  return (
    <div className="bg-surface border border-surface-container-high rounded-xl p-5 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-secondary">
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-primary font-display font-black text-2xl">{value}</p>
      {sub && <p className="text-secondary text-xs">{sub}</p>}
    </div>
  )
}

export default function AdminOverview() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const q = query(
      collection(db, 'orders'),
      where('createdAt', '>=', Timestamp.fromDate(todayStart)),
      orderBy('createdAt', 'desc'),
      limit(50)
    )
    const unsub = onSnapshot(q,
      (snap) => { setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setLoading(false) },
      (err) => { console.error(err); setLoading(false) }
    )
    return unsub
  }, [])

  const activeOrders = orders.filter((o) => ['received','preparing','delivering'].includes(o.status))
  const doneOrders   = orders.filter((o) => o.status === 'done')
  const revenue      = doneOrders.reduce((sum, o) => sum + (o.total ?? 0), 0)
  const itemsSold    = doneOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0), 0)
  const waits        = activeOrders.map((o) => o.waitMin).filter(Boolean)
  const avgWait      = waits.length ? Math.round(waits.reduce((a, b) => a + b, 0) / waits.length) : 0

  const STATUS_LABEL = {
    received:   'Đã nhận',
    preparing:  'Đang làm',
    delivering: 'Đang giao',
    done:       'Hoàn thành',
    cancelled:  'Đã hủy',
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-6">
        <h1 className="font-display font-black text-2xl uppercase tracking-tight text-primary">Tổng quan</h1>
        <p className="text-secondary text-sm mt-1">Hôm nay</p>
      </div>

      {loading && <Spinner />}

      {!loading && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-6 lg:grid-cols-4">
            <KpiCard icon="receipt_long"   label="Đơn đang xử lý" value={activeOrders.length} />
            <KpiCard icon="timer"          label="Thời gian TB"  value={avgWait ? `~${avgWait} phút` : 'N/A'} />
            <KpiCard icon="payments"       label="Doanh thu"     value={`${(revenue/1000).toFixed(0)}K`} sub="đồng" />
            <KpiCard icon="local_dining"   label="Món đã bán"    value={itemsSold} />
          </div>

          <div className="bg-surface border border-surface-container-high rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-container-high">
              <h2 className="text-primary font-bold text-sm uppercase tracking-wider">50 đơn gần nhất</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-container-high">
                    <th className="text-left px-4 py-3 text-secondary text-xs">Máy</th>
                    <th className="text-left px-4 py-3 text-secondary text-xs">Món</th>
                    <th className="text-right px-4 py-3 text-secondary text-xs">Tổng</th>
                    <th className="text-center px-4 py-3 text-secondary text-xs">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-surface-container-high last:border-0">
                      <td className="px-4 py-3 text-primary font-medium">Máy {order.machineNo}</td>
                      <td className="px-4 py-3 text-secondary text-xs">{order.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}</td>
                      <td className="px-4 py-3 text-right text-on-surface">{order.total?.toLocaleString('vi-VN')} đ</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-bold ${order.status === 'done' ? 'text-primary-fixed' : order.status === 'cancelled' ? 'text-error' : 'text-secondary'}`}>
                          {STATUS_LABEL[order.status] ?? order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-secondary">Chưa có đơn nào hôm nay.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
