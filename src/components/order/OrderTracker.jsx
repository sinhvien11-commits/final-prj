import { useTranslation } from 'react-i18next'
import OrderStepper from './OrderStepper'
import ReviewForm from '../ReviewForm'
import { useElapsed } from '../../hooks/useElapsed'
import { itemName } from '../../lib/itemName'

function fmtMMSS(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0')
  const s = String(secs % 60).padStart(2, '0')
  return `${m}:${s}`
}

const STATUS_LABEL = {
  received:   { key: 'order.statusReceived',   color: 'text-secondary' },
  preparing:  { key: 'order.statusPreparing',  color: 'text-primary-fixed' },
  delivering: { key: 'order.statusDelivering', color: 'text-primary-fixed' },
  done:       { key: 'order.statusDone',        color: 'text-secondary' },
  cancelled:  { key: 'order.statusCancelled',   color: 'text-error' },
}

// Completed / cancelled orders stay visible but are dimmed to separate them
// from orders still being processed.
const MUTED_STATUS = new Set(['done', 'cancelled'])

export default function OrderTracker({ order }) {
  const { t, i18n } = useTranslation()
  const statusInfo = STATUS_LABEL[order.status]
  const statusText = statusInfo ? t(statusInfo.key) : order.status
  const statusColor = statusInfo ? statusInfo.color : 'text-secondary'
  const muted = MUTED_STATUS.has(order.status)

  // Live "đã đợi" counter — only ticks while the order is still being processed.
  const elapsed = useElapsed(order.createdAt, !muted)
  const remainingMin = order.waitMin > 0
    ? Math.ceil(Math.max(0, order.waitMin * 60 - elapsed) / 60)
    : null

  return (
    <div className={`bg-surface border border-surface-container-high rounded-xl p-4 flex flex-col gap-3 ${muted ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-secondary text-xs uppercase tracking-wider">{t('orders.machine', { no: order.machineNo })}</p>
          <p className={`font-bold text-sm mt-0.5 ${statusColor}`}>{statusText}</p>
        </div>
        {!muted && (
          <div className="flex flex-col items-end gap-1">
            <span className="border border-primary-fixed text-primary-fixed rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">timer</span>
              {t('order.waited', { time: fmtMMSS(elapsed) })}
            </span>
            {remainingMin !== null && (
              <span className="text-secondary text-[11px]">
                {t('order.eta', { min: remainingMin })}
              </span>
            )}
          </div>
        )}
      </div>

      <OrderStepper status={order.status} />

      <div className="flex flex-col gap-1 pt-1 border-t border-surface-container-high">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-xs">
            <span className="text-secondary">{item.qty}x {itemName(item, i18n.language)}</span>
            <span className="text-on-surface">{(item.price * item.qty).toLocaleString('vi-VN')} đ</span>
          </div>
        ))}
        <div className="flex justify-between text-xs font-bold mt-1 pt-1 border-t border-surface-container-high">
          <span className="text-secondary">{t('order.total')}</span>
          <span className="text-primary">{order.total.toLocaleString('vi-VN')} đ</span>
        </div>
      </div>

      {/* Đơn đã hoàn thành → mời khách đánh giá (ẩn nếu đã đánh giá, theo localStorage). */}
      {order.status === 'done' && (
        <ReviewForm source="order" orderId={order.id} machineNo={order.machineNo} />
      )}
    </div>
  )
}
