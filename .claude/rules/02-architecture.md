---
description: Project file structure, Firebase client init, realtime data flow, and state architecture
alwaysApply: true
---

# Architecture

## Project Structure

```
src/
├── lib/
│   └── firebase.js              # Single Firebase init — exports auth, db, storage
├── context/
│   └── CartContext.jsx          # Global cart: items, total, machineNo
├── hooks/
│   ├── useAuth.js               # onAuthStateChanged + profile/role fetch
│   ├── useQueue.js              # onSnapshot → active orders → queue stats
│   ├── useOrders.js             # onSnapshot filtered by machineNo
│   ├── useMenu.js               # getDocs on menuItems (one-time fetch)
│   ├── useOrderNotifications.js # Customer: status change → toast + sound + Notification API
│   └── useNewOrderAlert.js      # Kitchen: new order arrival → alert
├── components/
│   ├── layout/
│   │   ├── TopAppBar.jsx
│   │   ├── BottomNav.jsx
│   │   └── RequireAuth.jsx      # Route guard for /admin
│   ├── ui/                      # Badge, Button, Card, ProgressBar, Spinner
│   ├── menu/                    # MenuCard, CategoryFilter, CartDrawer
│   ├── queue/                   # QueueStatusWidget, QueueList, WaitTimeBadge
│   └── order/                   # OrderTracker, OrderStepper
└── pages/
    ├── Home.jsx
    ├── Store.jsx
    ├── Orders.jsx
    ├── Esports.jsx
    ├── Quests.jsx
    ├── Review.jsx
    └── admin/
        ├── Login.jsx
        ├── Overview.jsx
        ├── Orders.jsx       # Kitchen Kanban board
        ├── Menu.jsx
        ├── MenuEdit.jsx
        └── Reports.jsx
```

## Firebase Client Init (`src/lib/firebase.js`)

```js
import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

const app = initializeApp({
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
})

export const auth    = getAuth(app)
export const db      = getFirestore(app)
export const storage = getStorage(app)

if (import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099')
  connectFirestoreEmulator(db, 'localhost', 8080)
  connectStorageEmulator(storage, 'localhost', 9199)
}
```

Import `auth`, `db`, `storage` from this file everywhere — never call `initializeApp` again.

## Realtime Data Flow

Firestore `onSnapshot` is the sole mechanism for live data. No polling, no manual refresh.

- `useQueue` → listens to all orders where `status in ['received','preparing','delivering']` → computes `{ activeOrders, avgWaitMin }` client-side
- `useOrders(machineNo)` → listens to orders filtered by `machineNo` + active statuses
- `useMenu` → one-time `getDocs` (menu rarely changes)
- Every `onSnapshot` returns an unsubscribe fn — **always return it from `useEffect`**

## State Architecture

- **CartContext** is the only global state: `{ items, total, machineNo }`
- All server data lives in hooks — no Redux
- Machine number: `localStorage('machineNo')` — number prompt on first visit, stored as string, parsed to `Number()` before Firestore queries
