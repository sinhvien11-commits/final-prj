import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

const TRANSITIONS = {
  preparing:  { message: 'Đơn hàng đang được chuẩn bị!',  icon: '🍳', sound: 'notify.mp3' },
  delivering: { message: 'Đơn hàng đang trên đường giao!', icon: '🛵', sound: 'notify.mp3' },
  done:       { message: 'Đơn hàng đã đến nơi! Enjoy 🎮', icon: '✅', sound: 'done.mp3'   },
  cancelled:  { message: 'Đơn hàng đã bị hủy.',            icon: '❌', sound: null         },
}

export function useOrderNotifications(orders) {
  const prevStatusRef = useRef({})

  useEffect(() => {
    const prev = prevStatusRef.current

    orders.forEach((order) => {
      const prevStatus = prev[order.id]

      if (prevStatus && prevStatus !== order.status) {
        const t = TRANSITIONS[order.status]
        if (!t) return

        toast(t.message, { icon: t.icon, duration: 6000 })

        if (t.sound) {
          new Audio(`/sounds/${t.sound}`).play().catch(() => {})
        }

        if (Notification.permission === 'granted') {
          new Notification(`Máy ${order.machineNo} — ${t.message}`, {
            body: order.items.map((i) => `${i.qty}x ${i.name}`).join(', '),
            icon: '/icon-192.png',
            tag:  order.id,
          })
        }
      }

      prev[order.id] = order.status
    })

    prevStatusRef.current = prev
  }, [orders])
}
