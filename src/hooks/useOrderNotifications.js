import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { itemName } from '../lib/itemName'

const TRANSITIONS = {
  preparing:  { key: 'notify.preparing',  icon: '🍳', sound: 'notify.mp3' },
  delivering: { key: 'notify.delivering', icon: '🛵', sound: 'notify.mp3' },
  done:       { key: 'notify.done',       icon: '✅', sound: 'done.mp3'   },
  cancelled:  { key: 'notify.cancelled',  icon: '❌', sound: null         },
}

export function useOrderNotifications(orders) {
  const { t, i18n } = useTranslation()
  const prevStatusRef = useRef({})

  useEffect(() => {
    const prev = prevStatusRef.current

    orders.forEach((order) => {
      const prevStatus = prev[order.id]

      if (prevStatus && prevStatus !== order.status) {
        const tr = TRANSITIONS[order.status]
        if (!tr) return

        const message = t(tr.key)
        toast(message, { icon: tr.icon, duration: 6000 })

        if (tr.sound) {
          new Audio(`/sounds/${tr.sound}`).play().catch(() => {})
        }

        if (Notification.permission === 'granted') {
          new Notification(`${t('orders.machine', { no: order.machineNo })} — ${message}`, {
            body: order.items.map((i) => `${i.qty}x ${itemName(i, i18n.language)}`).join(', '),
            icon: '/icon-192.png',
            tag:  order.id,
          })
        }
      }

      prev[order.id] = order.status
    })

    prevStatusRef.current = prev
  }, [orders, t])
}
