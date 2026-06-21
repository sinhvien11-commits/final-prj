---
description: Two-way real-time notification system — customer↔kitchen bidirectional alert flow
globs: ["**/useOrder*", "**/useNew*", "**/Orders*", "**/App*"]
alwaysApply: false
---

# Two-way Notification System

The core real-time feedback loop. **Both directions must work** for the app to feel live.

## Flow Diagram

```
Customer places order
        │
        ▼  addDoc('orders', ...)
  Firestore 'orders' collection
        │
        ├──► Kitchen onSnapshot fires immediately
        │         └─ useNewOrderAlert() → sound + toast "Đơn hàng mới!"
        │
        │    [Kitchen calls updateDoc → status changes]
        │
        └──► Customer onSnapshot fires (via useOrders)
                  └─ useOrderNotifications() → detects status transition
                            ├─ toast("Đơn đang trên đường giao!", { icon: '🛵' })
                            ├─ new Audio('/sounds/notify.mp3').play()
                            └─ new Notification("Máy 42 — Đơn đang giao!")
```

## Direction 1: Customer → Kitchen (`useNewOrderAlert`)

The kitchen `onSnapshot` fires automatically — no extra code for the data part. This hook adds the alert layer on top:

```js
// src/hooks/useNewOrderAlert.js
import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

export function useNewOrderAlert(receivedOrders) {
  const prevCountRef = useRef(null)

  useEffect(() => {
    // null = first snapshot on mount — skip to avoid false alerts
    if (prevCountRef.current === null) {
      prevCountRef.current = receivedOrders.length
      return
    }
    if (receivedOrders.length > prevCountRef.current) {
      toast('Đơn hàng mới!', { icon: '🔔', duration: 5000 })
      new Audio('/sounds/new-order.mp3').play().catch(() => {})
    }
    prevCountRef.current = receivedOrders.length
  }, [receivedOrders.length])
}
```

**Usage** in `pages/admin/Orders.jsx`:
```js
const receivedOrders = allOrders.filter(o => o.status === 'received')
useNewOrderAlert(receivedOrders)
```

## Direction 2: Kitchen → Customer (`useOrderNotifications`)

Detects status transitions on the customer's order list. Uses `prevStatusRef` to compare old vs new status — never fires on initial load.

```js
// src/hooks/useOrderNotifications.js
import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

const TRANSITIONS = {
  preparing:  { message: 'Đơn hàng đang được chuẩn bị!',  icon: '🍳', sound: 'notify.mp3' },
  delivering: { message: 'Đơn hàng đang trên đường giao!', icon: '🛵', sound: 'notify.mp3' },
  done:       { message: 'Đơn hàng đã đến nơi! Enjoy 🎮', icon: '✅', sound: 'done.mp3'   },
  cancelled:  { message: 'Đơn hàng đã bị hủy.',            icon: '❌', sound: null         },
}

export function useOrderNotifications(orders) {
  const prevStatusRef = useRef({}) // { [orderId]: status }

  useEffect(() => {
    const prev = prevStatusRef.current
    orders.forEach((order) => {
      const prevStatus = prev[order.id]
      if (prevStatus && prevStatus !== order.status) {
        const t = TRANSITIONS[order.status]
        if (!t) return

        toast(t.message, { icon: t.icon, duration: 6000 })

        if (t.sound) new Audio(`/sounds/${t.sound}`).play().catch(() => {})

        if (Notification.permission === 'granted') {
          new Notification(`Máy ${order.machineNo} — ${t.message}`, {
            body: order.items.map(i => `${i.qty}x ${i.name}`).join(', '),
            icon: '/icon-192.png',
            tag:  order.id, // deduplicate — same order won't stack notifications
          })
        }
      }
      prev[order.id] = order.status
    })
    prevStatusRef.current = prev
  }, [orders])
}
```

**Usage** in `pages/Orders.jsx`:
```js
const { orders } = useOrders(machineNo)
useOrderNotifications(orders)
```

## Browser Notification Permission

Request once in `App.jsx` on mount:

```js
useEffect(() => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}, [])
```

## Toast Provider

Add `<Toaster>` to `App.jsx`, styled to match the dark design system:

```jsx
import { Toaster } from 'react-hot-toast'

<Toaster
  position="top-center"
  toastOptions={{
    style: {
      background: '#1F1F1F',
      color: '#e2e2e2',
      border: '1px solid #2A2A2A',
      borderRadius: '12px',
    },
    success: { iconTheme: { primary: '#9EFF00', secondary: '#000' } },
  }}
/>
```

## Sound Files

Place in `public/sounds/` (royalty-free, under 100KB each):

| File | When played |
|---|---|
| `notify.mp3` | Order status changes to `preparing` or `delivering` |
| `done.mp3` | Order status changes to `done` |
| `new-order.mp3` | Kitchen receives a new order in `received` status |
