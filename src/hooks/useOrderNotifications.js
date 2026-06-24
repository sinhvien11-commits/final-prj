import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { itemName } from '../lib/itemName'
import { useSound } from '../context/SoundContext'

const TRANSITIONS = {
  // beep: chỉ kêu khi đơn KHÁCH chuyển sang 'đang làm' / 'đang giao'.
  preparing:  { key: 'notify.preparing',  icon: '🍳', beep: true  },
  delivering: { key: 'notify.delivering', icon: '🛵', beep: true  },
  done:       { key: 'notify.done',       icon: '✅', beep: false },
  cancelled:  { key: 'notify.cancelled',  icon: '❌', beep: false },
}

export function useOrderNotifications(orders) {
  const { t, i18n } = useTranslation()
  const { play } = useSound()
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

        if (tr.beep) play()

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
  }, [orders, t, play])
}
