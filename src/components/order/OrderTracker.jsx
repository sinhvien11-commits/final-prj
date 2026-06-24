import OrderStepper from './OrderStepper'
import { useElapsed } from '../../hooks/useElapsed'

function fmtMMSS(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0')
  const s = String(secs % 60).padStart(2, '0')
  return `${m}:${s}`
}

const STATUS_LABEL = {
  received:   { text: 'Đã nhận',    color: 'text-secondary' },
  preparing:  { text: 'Đang làm',   color: 'text-primary-fixed' },
  delivering: { text: 'Đang giao',  color: 'text-primary-fixed' },
  done:       { text: 'Hoàn thành', color: 'text-secondary' },
  cancelled:  { text: 'Đã huỷ',     color: 'text-error' },
}

// Completed / cancelled orders stay visible but are dimmed to separate them
// from orders still being processed.
const MUTED_STATUS = new Set(['done', 'cancelled'])

export default function OrderTracker({ order }) {
  const statusInfo = STATUS_LABEL[order.status] ?? { text: order.status, color: 'text-secondary' }
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
          <p className="text-secondary text-xs uppercase tracking-wider">Máy {order.machineNo}</p>
          <p className={`font-bold text-sm mt-0.5 ${statusInfo.color}`}>{statusInfo.text}</p>
        </div>
        {!muted && (
          <div className="flex flex-col items-end gap-1">
            <span className="border border-primary-fixed text-primary-fixed rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">timer</span>
              Đã đợi {fmtMMSS(elapsed)}
            </span>
            {remainingMin !== null && (
              <span className="text-secondary text-[11px]">
                dự kiến còn ~{remainingMin} phút
              </span>
            )}
          </div>
        )}
      </div>

      <OrderStepper status={order.status} />

      <div className="flex flex-col gap-1 pt-1 border-t border-surface-container-high">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-xs">
            <span className="text-secondary">{item.qty}x {item.name}</span>
            <span className="text-on-surface">{(item.price * item.qty).toLocaleString('vi-VN')} đ</span>
          </div>
        ))}
        <div className="flex justify-between text-xs font-bold mt-1 pt-1 border-t border-surface-container-high">
          <span className="text-secondary">Tổng</span>
          <span className="text-primary">{order.total.toLocaleString('vi-VN')} đ</span>
        </div>
      </div>
    </div>
  )
}
