import { useCart } from '../context/CartContext'
import { useOrders } from '../hooks/useOrders'
import { useOrderNotifications } from '../hooks/useOrderNotifications'
import OrderTracker from '../components/order/OrderTracker'
import Spinner from '../components/ui/Spinner'

export default function Orders() {
  const { machineNo } = useCart()
  const { orders, error } = useOrders(machineNo)
  useOrderNotifications(orders)

  if (!machineNo) {
    return (
      <div className="pt-16 pb-20 px-4 flex items-center justify-center min-h-screen">
        <p className="text-secondary text-center">Vui lòng nhập số máy để xem đơn hàng.</p>
      </div>
    )
  }

  return (
    <div className="pt-16 pb-20 px-4 flex flex-col gap-4">
      <div className="py-3">
        <h1 className="font-display font-black text-xl uppercase tracking-tight text-primary">
          Đơn hàng
        </h1>
        <p className="text-secondary text-xs mt-1">Máy {machineNo}</p>
      </div>

      {error && <p className="text-error text-center py-8">{error}</p>}

      {!error && orders.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="material-symbols-outlined text-5xl text-secondary">receipt_long</span>
          <p className="text-secondary text-sm">Chưa có đơn hàng nào.</p>
        </div>
      )}

      {orders.map((order) => (
        <OrderTracker key={order.id} order={order} />
      ))}
    </div>
  )
}
