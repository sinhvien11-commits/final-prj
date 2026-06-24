import { useTranslation } from 'react-i18next'
import { useCart } from '../context/CartContext'
import { useOrders } from '../hooks/useOrders'
import { useOrderNotifications } from '../hooks/useOrderNotifications'
import OrderTracker from '../components/order/OrderTracker'
import Spinner from '../components/ui/Spinner'
import LanguageToggle from '../components/layout/LanguageToggle'
import SoundToggle from '../components/layout/SoundToggle'

export default function Orders() {
  const { t } = useTranslation()
  const { machineNo } = useCart()
  const { orders, error } = useOrders(machineNo)
  useOrderNotifications(orders)

  if (!machineNo) {
    return (
      <div className="pt-16 pb-20 px-4 flex items-center justify-center min-h-screen">
        <p className="text-secondary text-center">{t('orders.enterMachine')}</p>
      </div>
    )
  }

  return (
    <div className="pt-16 pb-20 px-4 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2 py-3">
        <div>
          <h1 className="font-display font-black text-xl uppercase tracking-tight text-primary">
            {t('orders.title')}
          </h1>
          <p className="text-secondary text-xs mt-1">{t('orders.machine', { no: machineNo })}</p>
        </div>
        <div className="flex items-center gap-2">
          <SoundToggle />
          <LanguageToggle />
        </div>
      </div>

      {error && orders.length === 0 && <p className="text-error text-center py-8">{t(error)}</p>}

      {!error && orders.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="material-symbols-outlined text-5xl text-secondary">receipt_long</span>
          <p className="text-secondary text-sm">{t('orders.empty')}</p>
        </div>
      )}

      {orders.map((order) => (
        <OrderTracker key={order.id} order={order} />
      ))}
    </div>
  )
}
