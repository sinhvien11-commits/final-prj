import { useState, useEffect } from 'react'
import { collection, query, orderBy, where, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import Spinner from '../../components/ui/Spinner'

export default function AdminReports() {
  const [date, setDate]       = useState(() => new Date().toISOString().split('T')[0])
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchDay() {
      setLoading(true)
      const start = new Date(date)
      start.setHours(0, 0, 0, 0)
      const end = new Date(date)
      end.setHours(23, 59, 59, 999)

      try {
        const snap = await getDocs(query(
          collection(db, 'orders'),
          where('createdAt', '>=', Timestamp.fromDate(start)),
          where('createdAt', '<=', Timestamp.fromDate(end)),
          orderBy('createdAt', 'desc')
        ))
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDay()
  }, [date])

  const doneOrders = orders.filter((o) => o.status === 'done')
  const revenue    = doneOrders.reduce((sum, o) => sum + (o.total ?? 0), 0)
  const itemsSold  = doneOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0), 0)

  // Aggregate items sold
  const itemMap = {}
  doneOrders.forEach((o) => {
    o.items.forEach((i) => {
      itemMap[i.name] = (itemMap[i.name] ?? 0) + i.qty
    })
  })
  const topItems = Object.entries(itemMap).sort((a, b) => b[1] - a[1])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="font-display font-black text-2xl uppercase tracking-tight text-primary">Báo cáo</h1>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-surface-container border border-surface-container-high rounded-xl px-4 py-2 text-primary text-sm focus:outline-none focus:border-primary-fixed"
        />
      </div>

      {loading && <Spinner />}

      {!loading && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-surface border border-surface-container-high rounded-xl p-4 text-center">
              <p className="text-secondary text-xs uppercase tracking-wider mb-1">Tổng đơn</p>
              <p className="text-primary font-display font-black text-2xl">{orders.length}</p>
            </div>
            <div className="bg-surface border border-surface-container-high rounded-xl p-4 text-center">
              <p className="text-secondary text-xs uppercase tracking-wider mb-1">Doanh thu</p>
              <p className="text-primary-fixed font-display font-black text-2xl">{(revenue/1000).toFixed(0)}K</p>
            </div>
            <div className="bg-surface border border-surface-container-high rounded-xl p-4 text-center">
              <p className="text-secondary text-xs uppercase tracking-wider mb-1">Món bán</p>
              <p className="text-primary font-display font-black text-2xl">{itemsSold}</p>
            </div>
          </div>

          {topItems.length > 0 && (
            <div className="bg-surface border border-surface-container-high rounded-xl p-5 mb-4">
              <h2 className="text-primary font-bold text-sm uppercase tracking-wider mb-3">Món bán chạy</h2>
              <div className="flex flex-col gap-2">
                {topItems.map(([name, qty]) => (
                  <div key={name} className="flex items-center justify-between">
                    <span className="text-secondary text-sm">{name}</span>
                    <span className="text-primary-fixed font-bold text-sm">{qty} món</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-surface border border-surface-container-high rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-container-high">
              <h2 className="text-primary font-bold text-sm uppercase tracking-wider">
                Lịch sử đơn hàng ({orders.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-container-high">
                    <th className="text-left px-4 py-3 text-secondary text-xs">Giờ</th>
                    <th className="text-left px-4 py-3 text-secondary text-xs">Máy</th>
                    <th className="text-right px-4 py-3 text-secondary text-xs">Tổng</th>
                    <th className="text-center px-4 py-3 text-secondary text-xs">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-surface-container-high last:border-0">
                      <td className="px-4 py-3 text-secondary text-xs">
                        {order.createdAt?.toDate?.().toLocaleTimeString('vi-VN', { hour:'2-digit', minute:'2-digit' }) ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-primary">Máy {order.machineNo}</td>
                      <td className="px-4 py-3 text-right">{order.total?.toLocaleString('vi-VN')} đ</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-bold ${order.status === 'done' ? 'text-primary-fixed' : order.status === 'cancelled' ? 'text-error' : 'text-secondary'}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-secondary">Không có đơn nào ngày này.</td></tr>
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
