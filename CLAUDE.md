# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Group 11 — OEG Cyber Hub F&B Queue App**

A mobile-first F&B (Food & Beverage) queue management system for OEG Cyber Hub cyber cafe. Customers at a gaming station can view the live F&B queue, place food/drink orders, and track their order status in real-time.

The `site4/` folder contains the **HTML/CSS prototype** (design reference). The production app is a separate React + Vite project using the same design system.

---

## Commands

```bash
# First-time setup
npm create vite@latest . -- --template react
npm install firebase react-router-dom react-hot-toast
npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom jsdom
npx tailwindcss init -p

# Development
npm run dev

# Tests
npm run test          # vitest watch mode
npm run test:run      # single run (CI)
npm run test:ui       # vitest UI

# Firebase CLI (install once globally)
npm install -g firebase-tools
firebase login
firebase init          # select Hosting + Firestore + Storage
firebase emulators:start               # local emulators for dev/test
firebase deploy
firebase deploy --only hosting
firebase deploy --only firestore:rules,storage:rules
```

### Environment Variables (`.env.local`)

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Set to "true" during development to use local Firebase Emulators
VITE_USE_EMULATORS=false
```

---

## Production Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS v3 |
| Database | Firebase Firestore (NoSQL) |
| Auth | Firebase Authentication (email/password) |
| Real-time | Firestore `onSnapshot` listeners |
| File storage | Firebase Storage |
| Hosting | Firebase Hosting |
| Routing | React Router v6 |
| State | React Context (CartContext) + hooks |
| SDK | `firebase` v10 (modular) |
| Notifications (in-app) | `react-hot-toast` + Browser Notification API |
| Testing | Vitest + React Testing Library + Firebase Emulator Suite |

---

## Architecture

### Project Structure

```
src/
├── lib/
│   └── firebase.js              # Firebase app init + exported auth/db/storage
├── context/
│   └── CartContext.jsx          # Global cart state (items, total, machineNo)
├── hooks/
│   ├── useAuth.js               # onAuthStateChanged + profile/role fetch
│   ├── useQueue.js              # onSnapshot on active orders → queue stats
│   ├── useOrders.js             # onSnapshot filtered by machineNo
│   ├── useMenu.js               # getDocs on menuItems (one-time)
│   ├── useOrderNotifications.js # Customer-side: detects status changes → toast + sound
│   └── useNewOrderAlert.js      # Kitchen-side: detects new incoming orders → alert
├── components/
│   ├── layout/
│   │   ├── TopAppBar.jsx
│   │   ├── BottomNav.jsx
│   │   └── RequireAuth.jsx      # Route guard for /admin pages
│   ├── ui/
│   │   ├── Badge.jsx            # Status badge (neon green pill)
│   │   ├── Button.jsx           # Primary / secondary / ghost variants
│   │   ├── Card.jsx             # Dark card wrapper
│   │   ├── ProgressBar.jsx      # Neon green animated bar
│   │   └── Spinner.jsx          # Loading spinner
│   ├── menu/
│   │   ├── MenuCard.jsx         # Product card with image, price, add button
│   │   ├── CategoryFilter.jsx   # Horizontal scroll filter chips
│   │   └── CartDrawer.jsx       # Slide-up cart + checkout
│   ├── queue/
│   │   ├── QueueStatusWidget.jsx # Hero widget: active orders + avg wait
│   │   ├── QueueList.jsx         # List of orders in queue (position view)
│   │   └── WaitTimeBadge.jsx     # "~X phút" neon bordered pill
│   └── order/
│       ├── OrderTracker.jsx      # Full order card with status + countdown
│       └── OrderStepper.jsx      # 4-step progress bar (received→done)
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
        ├── Orders.jsx
        ├── Menu.jsx
        ├── MenuEdit.jsx
        └── Reports.jsx
```

### Firebase Client Init (`src/lib/firebase.js`)

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

### Realtime Data Flow

Firestore uses `onSnapshot` for real-time updates — no polling, no channels.

- **`useQueue`** → `onSnapshot` on `orders` where `status in ['received','preparing','delivering']` → computes `{ activeOrders, avgWaitMin }` client-side
- **`useOrders(machineNo)`** → `onSnapshot` filtered by `machineNo` + active statuses
- **`useMenu`** → `getDocs` one-time on `menuItems` (menu rarely changes)
- All `onSnapshot` calls return an unsubscribe function — call it in `useEffect` cleanup

### State Architecture

- **CartContext** is the only global state: cart items, running total, current machineNo
- All data-fetching state lives in hooks — no Redux needed
- Machine number stored in `localStorage('machineNo')` — prompted on first visit

---

## Two-way Notification System

This is the core real-time feedback loop. Both directions must work for the app to feel live.

```
Customer places order
        │
        ▼ addDoc('orders', ...)
   Firestore 'orders' collection
        │
        ├──► Kitchen onSnapshot fires
        │         └─ useNewOrderAlert() → sound + toast "Đơn hàng mới!"
        │
        │    [Kitchen advances status via updateDoc]
        │
        └──► Customer onSnapshot fires (via useOrders)
                  └─ useOrderNotifications() → detects status change
                            ├─ toast.success("Đang chuẩn bị!")
                            ├─ new Audio('/sounds/notify.mp3').play()
                            └─ new Notification("Máy 42 — Đơn đang giao!")
```

### Direction 1: Customer → Kitchen

When the customer calls `addDoc(collection(db, 'orders'), ...)`, the kitchen's `onSnapshot` fires immediately. No extra code needed — the Firestore listener on the kitchen board automatically shows the new OrderCard in the RECEIVED column.

The kitchen-side hook also plays a sound for new arrivals:

```js
// src/hooks/useNewOrderAlert.js
import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

export function useNewOrderAlert(receivedOrders) {
  const prevCountRef = useRef(null)

  useEffect(() => {
    // Skip the initial snapshot (don't alert on page load)
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

Usage in `pages/admin/Orders.jsx`:
```js
const receivedOrders = allOrders.filter(o => o.status === 'received')
useNewOrderAlert(receivedOrders)
```

### Direction 2: Kitchen → Customer

When kitchen calls `updateDoc(doc(db, 'orders', id), { status: 'delivering' })`, the customer's `onSnapshot` fires. The `useOrderNotifications` hook sits between the data and the UI, detecting transitions and triggering alerts:

```js
// src/hooks/useOrderNotifications.js
import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

const TRANSITIONS = {
  preparing:  { message: 'Đơn hàng đang được chuẩn bị!', icon: '🍳', sound: 'notify.mp3' },
  delivering: { message: 'Đơn hàng đang trên đường giao!', icon: '🛵', sound: 'notify.mp3' },
  done:       { message: 'Đơn hàng đã đến nơi! Enjoy 🎮', icon: '✅', sound: 'done.mp3' },
  cancelled:  { message: 'Đơn hàng đã bị hủy.',           icon: '❌', sound: null },
}

export function useOrderNotifications(orders) {
  // Map of orderId → last known status
  const prevStatusRef = useRef({})

  useEffect(() => {
    const prev = prevStatusRef.current

    orders.forEach((order) => {
      const previousStatus = prev[order.id]

      // Only fire on a real transition, not on first load
      if (previousStatus && previousStatus !== order.status) {
        const t = TRANSITIONS[order.status]
        if (!t) return

        toast(t.message, { icon: t.icon, duration: 6000 })

        if (t.sound) {
          new Audio(`/sounds/${t.sound}`).play().catch(() => {})
        }

        // Browser push notification (works even if tab is not focused)
        if (Notification.permission === 'granted') {
          new Notification(`Máy ${order.machineNo} — ${t.message}`, {
            body: order.items.map(i => `${i.qty}x ${i.name}`).join(', '),
            icon: '/icon-192.png',
            tag:  order.id,  // prevents duplicate notifications for same order
          })
        }
      }

      prev[order.id] = order.status
    })

    prevStatusRef.current = prev
  }, [orders])
}
```

Usage in `pages/Orders.jsx`:
```js
const orders = useOrders(machineNo)
useOrderNotifications(orders)   // fires toasts + Browser API on any status change
```

### Browser Notification Permission

Request on first visit in `App.jsx`:

```js
useEffect(() => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}, [])
```

### Sound Files

Place audio files in `public/sounds/`:
- `public/sounds/notify.mp3` — short chime (status update)
- `public/sounds/done.mp3` — completion sound
- `public/sounds/new-order.mp3` — kitchen alert for new order

Use royalty-free files from Mixkit or Pixabay. Keep under 100KB each.

### Toast Provider Setup

Wrap the app in `App.jsx`:

```jsx
import { Toaster } from 'react-hot-toast'

export default function App() {
  return (
    <>
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
      {/* routes ... */}
    </>
  )
}
```

---

## Error Handling

### Convention: Where Errors Are Caught

| Layer | What throws | How to handle |
|---|---|---|
| Firestore reads (`getDocs`, `onSnapshot`) | Network errors, permissions | Catch in hook → `setError(err.message)` → show inline error state in component |
| Firestore writes (`addDoc`, `updateDoc`) | Permissions, offline | Catch in event handler → `toast.error(...)` |
| Firebase Auth (`signInWithEmailAndPassword`) | Wrong credentials, network | Catch in Login form → map error code → show inline field error |
| Image upload (`uploadBytes`) | File size, network | Catch in MenuEdit → `toast.error(...)` |
| Page-level crash (unexpected) | JS runtime error | `<ErrorBoundary>` wrapping each route |

### Toast Pattern (write operations)

```js
// In any event handler or async function — NOT in useEffect
async function handlePlaceOrder() {
  try {
    await addDoc(collection(db, 'orders'), orderData)
    toast.success('Đặt hàng thành công!')
  } catch (err) {
    toast.error('Không thể đặt hàng. Vui lòng thử lại.')
    console.error(err)
  }
}
```

### Inline Error State Pattern (data hooks)

```js
// In hooks that load data
const [error, setError] = useState(null)

const unsub = onSnapshot(q, (snap) => { ... }, (err) => {
  setError('Không thể tải dữ liệu.')
  console.error(err)
})

// In component
if (error) return <p className="text-error text-center py-8">{error}</p>
```

### Firebase Auth Error Codes → Vietnamese Messages

```js
// src/lib/authErrors.js
export const AUTH_ERRORS = {
  'auth/user-not-found':   'Email không tồn tại.',
  'auth/wrong-password':   'Sai mật khẩu.',
  'auth/too-many-requests':'Quá nhiều lần thử. Vui lòng đợi.',
  'auth/network-request-failed': 'Lỗi kết nối mạng.',
}

export function getAuthError(code) {
  return AUTH_ERRORS[code] ?? 'Đã có lỗi xảy ra. Vui lòng thử lại.'
}
```

Usage in `Login.jsx`:
```js
} catch (err) {
  setError(getAuthError(err.code))
}
```

### Error Boundary (`src/components/layout/ErrorBoundary.jsx`)

```jsx
import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() { return { hasError: true } }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-5 text-center">
          <span className="material-symbols-outlined text-5xl text-error">error</span>
          <p className="text-primary font-bold">Đã có lỗi xảy ra.</p>
          <button
            className="border border-primary-fixed text-primary-fixed px-4 py-2 rounded-lg text-sm"
            onClick={() => window.location.reload()}
          >
            Tải lại trang
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
```

Wrap each route in `App.jsx`:
```jsx
<Route path="/" element={<ErrorBoundary><Home /></ErrorBoundary>} />
```

### Loading States

Every data-fetching component must render a skeleton or spinner while loading — never a blank screen.

```jsx
if (loading) return <Spinner />
if (error)   return <p className="text-error">{error}</p>
return <ActualContent />
```

---

## Prototype → React Component Mapping

Each HTML file in `site4/` maps to a React page and set of components. Use these files as the visual spec for the corresponding React component.

### `site4/05-home.html` → `pages/Home.jsx`

| Element in HTML | React component |
|---|---|
| Facility card (black card, rounded-[20px]) | `components/ui/Card.jsx` |
| "ĐANG MỞ CỬA" pulsing green dot + pill | `components/ui/Badge.jsx` (variant="live") |
| "Tỷ lệ lấp đầy: 87%" + neon progress bar | `components/ui/ProgressBar.jsx` |
| `QueueStatusWidget` occupancy + wait stats | `components/queue/QueueStatusWidget.jsx` |
| "XEM THÔNG TIN" / "XEM BẢN ĐỒ" buttons | `components/ui/Button.jsx` (primary / ghost) |
| "PING HỆ THỐNG: 4ms" stat | Inline in `QueueStatusWidget` |

### `site4/02-store.html` → `pages/Store.jsx`

| Element in HTML | React component |
|---|---|
| Active order section (top widget) | `components/order/OrderTracker.jsx` |
| 3-dot progress track + step dots | `components/order/OrderStepper.jsx` |
| "~12 phút" badge | `components/queue/WaitTimeBadge.jsx` |
| Category filter chips (horizontal scroll) | `components/menu/CategoryFilter.jsx` |
| Product card (image + name + time + price + add btn) | `components/menu/MenuCard.jsx` |
| Out-of-stock overlay ("Hết hàng" label) | State on `MenuCard` — `opacity-50 grayscale pointer-events-none` |
| Floating cart button + slide-up sheet | `components/menu/CartDrawer.jsx` |

### `site4/03-esports.html` → `pages/Esports.jsx`

| Element in HTML | React component |
|---|---|
| "ĐANG CHƠI" status pill | `components/ui/Badge.jsx` (variant="live") |
| "Ghế A12" + session timer (02:38:22) | Inline in `Esports.jsx` with `setInterval` countdown |
| "GIA HẠN THÊM GIỜ" CTA button | `components/ui/Button.jsx` (variant="primary") |
| "GỌI HỖ TRỢ KỸ THUẬT" button | `components/ui/Button.jsx` (variant="ghost") |

### `site4/04-quests.html` → `pages/Quests.jsx`

| Element in HTML | React component |
|---|---|
| "THÀNH VIÊN VÀNG" + points card | Inline section in `Quests.jsx` |
| "ĐỔI VOUCHER" button | `components/ui/Button.jsx` |
| Daily task list header + countdown | Inline in `Quests.jsx` |
| Task card (icon + name + progress bar + points) | `components/quests/TaskCard.jsx` |
| Completed task (strikethrough + check icon) | State variant on `TaskCard` |
| Progress bar within task | `components/ui/ProgressBar.jsx` |

### `site4/01-review.html` → `pages/Review.jsx`

| Element in HTML | React component |
|---|---|
| Blurred backdrop overlay | `bg-black/70 backdrop-blur-md` fixed overlay |
| Glass panel modal (`glass-panel` class) | `components/ui/Modal.jsx` or inline card |
| Emoji rating buttons (5 emojis) | Inline `EmojiRating` component in `Review.jsx` |
| Textarea feedback input | Inline `<textarea>` with `cyber-input` styles |
| "GỬI ĐÁNH GIÁ" button + shine animation | `components/ui/Button.jsx` (variant="primary") with CSS keyframe |
| "GIẢM 10%" reward text | Inline text in `Review.jsx` |

### `site4/index.html` → `App.jsx` + `components/layout/`

| Element in HTML | React equivalent |
|---|---|
| `.phone-wrap` max-width container | `<div className="max-w-[480px] mx-auto">` in `App.jsx` |
| `<nav class="bottom-nav">` | `components/layout/BottomNav.jsx` |
| `iframe.src = btn.dataset.src` routing | React Router `<Routes>` + `<NavLink>` |
| Active tab highlight (`#9EFF00`) | `NavLink` className with active state |

---

## Testing / QA

### Framework

- **Unit/integration:** Vitest + React Testing Library
- **Firebase rules:** Firebase Emulator Suite (`firebase emulators:start`)
- **Manual QA:** Firebase Emulator UI at `localhost:4000`

### Vitest Config (`vite.config.js`)

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
})
```

```js
// src/test/setup.js
import '@testing-library/jest-dom'
```

### What to Test

**1. Hooks — `useOrderNotifications`** (highest priority — core bidirectional logic)

```js
// src/hooks/useOrderNotifications.test.js
import { renderHook } from '@testing-library/react'
import { useOrderNotifications } from './useOrderNotifications'
import toast from 'react-hot-toast'

vi.mock('react-hot-toast')

const makeOrder = (id, status) => ({ id, machineNo: 1, status, items: [] })

test('fires toast when status changes to delivering', () => {
  const orders = [makeOrder('abc', 'preparing')]
  const { rerender } = renderHook(({ orders }) => useOrderNotifications(orders), {
    initialProps: { orders },
  })
  rerender({ orders: [makeOrder('abc', 'delivering')] })
  expect(toast).toHaveBeenCalledWith(
    expect.stringContaining('đang trên đường'),
    expect.objectContaining({ icon: '🛵' })
  )
})

test('does NOT fire toast on initial load', () => {
  renderHook(() => useOrderNotifications([makeOrder('abc', 'received')]))
  expect(toast).not.toHaveBeenCalled()
})
```

**2. Components — `MenuCard`**

```js
// src/components/menu/MenuCard.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import MenuCard from './MenuCard'

const item = { id: '1', name: 'Neon Burger', price: 85000, prepMin: 15, inStock: true, imageUrl: '' }

test('shows item name and price', () => {
  render(<MenuCard item={item} onAdd={() => {}} />)
  expect(screen.getByText('Neon Burger')).toBeInTheDocument()
  expect(screen.getByText('85,000 đ')).toBeInTheDocument()
})

test('add button is disabled when out of stock', () => {
  render(<MenuCard item={{ ...item, inStock: false }} onAdd={() => {}} />)
  expect(screen.getByRole('button', { name: /thêm/i })).toBeDisabled()
})
```

**3. Auth error mapping**

```js
// src/lib/authErrors.test.js
import { getAuthError } from './authErrors'

test('maps known error code', () => {
  expect(getAuthError('auth/wrong-password')).toBe('Sai mật khẩu.')
})
test('returns fallback for unknown code', () => {
  expect(getAuthError('auth/unknown')).toMatch(/thử lại/)
})
```

### Firestore Rules Testing (Firebase Emulator)

```bash
# Start emulators
firebase emulators:start --only firestore,auth

# Run rules tests
npm install -D @firebase/rules-unit-testing
```

```js
// src/test/firestore.rules.test.js
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore'

let testEnv

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({ projectId: 'demo-oeg', firestore: { host: 'localhost', port: 8080 } })
})
afterAll(() => testEnv.cleanup())

test('anonymous user can create order', async () => {
  const db = testEnv.unauthenticatedContext().firestore()
  await assertSucceeds(addDoc(collection(db, 'orders'), { machineNo: 1, status: 'received', items: [], total: 0 }))
})

test('anonymous user cannot update order status', async () => {
  const db = testEnv.unauthenticatedContext().firestore()
  await assertFails(updateDoc(doc(db, 'orders', 'fake-id'), { status: 'preparing' }))
})
```

### Manual QA Checklist (run before every deploy)

- [ ] New order appears in kitchen board within 2 seconds (no refresh)
- [ ] Customer receives toast when status changes to `delivering`
- [ ] Browser notification fires when tab is not focused (permission must be granted)
- [ ] Sound plays on status change (test in noisy environment)
- [ ] Out-of-stock item is visually dimmed and unclickable
- [ ] Cart total updates correctly when adding/removing items
- [ ] Firestore Rules Playground: anonymous write to `menuItems` → should be denied

---

## Auth Flow

### Roles

| Role | Who | How authenticated |
|---|---|---|
| `anon` | Customers at any machine | No Firebase Auth — machine number in `localStorage` |
| `kitchen` | Kitchen / front-of-house staff | Email + password via Firebase Auth |
| `admin` | Manager / owner | Email + password, `role = 'admin'` in `profiles/{uid}` |

### Customer (Anonymous) Flow

Customers never log in. On first visit the app shows a modal to enter a machine number, saved to `localStorage('machineNo')`.

```
App loads
  └─ localStorage has machineNo?
       ├─ YES → proceed to Home
       └─ NO  → show MachineModal → save to localStorage → proceed
```

### Staff / Admin Login Flow

```
/admin visited
  └─ onAuthStateChanged fires with user?
       ├─ YES → getDoc(profiles/{uid}) → check role
       │          ├─ 'kitchen' → /admin/orders (Kitchen Board)
       │          └─ 'admin'   → /admin (Full Dashboard)
       └─ NO  → redirect to /admin/login
                  └─ signInWithEmailAndPassword(auth, email, password)
                       ├─ success → redirect to /admin
                       └─ error   → getAuthError(err.code) → inline field error
```

### Auth Hook (`src/hooks/useAuth.js`)

```js
import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

export function useAuth() {
  const [user, setUser]       = useState(undefined) // undefined = loading
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        const snap = await getDoc(doc(db, 'profiles', firebaseUser.uid))
        setProfile(snap.exists() ? snap.data() : null)
      } else {
        setProfile(null)
      }
    })
    return unsub
  }, [])

  return { user, profile, role: profile?.role ?? 'anon', loading: user === undefined }
}
```

### Route Guard (`src/components/layout/RequireAuth.jsx`)

```jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Spinner from '../ui/Spinner'

export default function RequireAuth({ children, allowedRoles }) {
  const { user, role, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/admin/login" replace />
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/admin" replace />
  return children
}
```

---

## Admin / Kitchen Dashboard

A **separate route tree** under `/admin`, desktop-optimized (full-width layout, no 480px phone-wrap).

### Pages

| Route | Access | Purpose |
|---|---|---|
| `/admin/login` | Everyone | Email + password sign-in |
| `/admin` | admin | Overview: revenue, order count, avg wait |
| `/admin/orders` | kitchen, admin | Live Kanban board — advance order status |
| `/admin/menu` | admin | List all items + toggle `inStock` |
| `/admin/menu/new` | admin | Create item + image upload to Firebase Storage |
| `/admin/menu/:id` | admin | Edit item |
| `/admin/reports` | admin | Daily order history + revenue chart |

### Kitchen Board (`/admin/orders`)

Three-column Kanban updated via Firestore `onSnapshot` — no page refresh needed.

```
┌──────────────────────────────────────────────────┐
│  RECEIVED (3)     PREPARING (2)   DELIVERING (1) │
│  ─────────────    ─────────────   ────────────── │
│  [OrderCard]      [OrderCard]     [OrderCard]    │
│  [OrderCard]      [OrderCard]                    │
│  [OrderCard]                                     │
└──────────────────────────────────────────────────┘
```

Each `OrderCard` shows: machine number, item list, elapsed time, and buttons to advance or cancel. `useNewOrderAlert` is active on this page.

**Status transitions:**
```
received → preparing → delivering → done
    ↓           ↓
cancelled   cancelled
```

### Admin Overview (`/admin`)

4 KPI cards → Active Orders · Avg Wait Time · Revenue Today · Items Sold Today  
Below: table of last 50 orders ordered by `createdAt` descending.

### Menu Management (`/admin/menu`)

Table with inline `inStock` toggle (`updateDoc`). Edit → `/admin/menu/:id`. Image upload uses `uploadBytes` to Firebase Storage; `getDownloadURL` saves to `menuItems/{id}.imageUrl`.

---

## Firestore Data Model

### Collections

```
firestore/
├── menuItems/{itemId}
│   ├── name         string
│   ├── category     string   "food" | "drinks" | "combo"
│   ├── price        number   VND
│   ├── prepMin      number
│   ├── imageUrl     string
│   ├── inStock      boolean
│   ├── isFeatured   boolean
│   └── createdAt    timestamp
│
├── orders/{orderId}
│   ├── machineNo    number
│   ├── items        array    [{ id, name, qty, price }]
│   ├── total        number   VND
│   ├── status       string   received|preparing|delivering|done|cancelled
│   ├── waitMin      number
│   ├── note         string
│   ├── createdAt    timestamp
│   └── updatedAt    timestamp
│
└── profiles/{uid}
    ├── role         string   "kitchen" | "admin"
    ├── name         string
    └── createdAt    timestamp
```

### ERD

```
Firebase Authentication
┌─────────────────────────┐
│        User             │
│─────────────────────────│
│ uid          string     │
│ email        string     │
└────────────┬────────────┘
             │ uid as document ID
             ▼
┌─────────────────────────┐
│  profiles/{uid}         │
│─────────────────────────│
│ role    string          │  "kitchen" | "admin"
│ name    string          │
└─────────────────────────┘


┌───────────────────────────────┐
│  menuItems/{itemId}           │
│───────────────────────────────│
│ name, category, price ...     │
│ imageUrl  Firebase Storage URL│
└───────────────┬───────────────┘
                │ id embedded in orders.items array (denormalized)
                ▼
┌──────────────────────────────────────┐
│  orders/{orderId}                    │
│──────────────────────────────────────│
│ machineNo  number  (anonymous)       │
│ items      array   [{ id, name,      │
│                      qty, price }]   │
│ status     string                    │
│ waitMin    number                    │
└──────────────────────────────────────┘
```

`orders.items` is denormalized (price snapshot) so historical orders survive menu edits.

---

## Role Permissions

### Capability Matrix

| Action | anon (customer) | kitchen | admin |
|---|---|---|---|
| View menu | ✅ | ✅ | ✅ |
| Place order | ✅ | ✅ | ✅ |
| View all orders | ✅ | ✅ | ✅ |
| Advance order status | ❌ | ✅ | ✅ |
| Cancel order | ❌ | ✅ | ✅ |
| Delete order | ❌ | ❌ | ✅ |
| Toggle `inStock` | ❌ | ❌ | ✅ |
| Create / edit menu items | ❌ | ❌ | ✅ |
| Upload menu images | ❌ | ❌ | ✅ |
| View reports | ❌ | ❌ | ✅ |

### Firestore Security Rules (`firestore.rules`)

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function role() {
      return get(/databases/$(database)/documents/profiles/$(request.auth.uid)).data.role;
    }
    function isKitchenOrAdmin() {
      return request.auth != null && role() in ['kitchen', 'admin'];
    }
    function isAdmin() {
      return request.auth != null && role() == 'admin';
    }

    match /menuItems/{itemId} {
      allow read:  if true;
      allow write: if isAdmin();
    }

    match /orders/{orderId} {
      allow read:   if true;
      allow create: if true;
      allow update: if isKitchenOrAdmin();
      allow delete: if isAdmin();
    }

    match /profiles/{uid} {
      allow read, update: if request.auth != null && request.auth.uid == uid;
      allow read, write:  if isAdmin();
    }
  }
}
```

### Firebase Storage Rules (`storage.rules`)

```js
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /menu-images/{imageId} {
      allow read:  if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## Hooks — Firebase Implementation

### `useQueue.js`

```js
import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useQueue() {
  const [queue, setQueue] = useState({ activeOrders: 0, avgWaitMin: 0 })
  const [error, setError] = useState(null)

  useEffect(() => {
    const q = query(
      collection(db, 'orders'),
      where('status', 'in', ['received', 'preparing', 'delivering'])
    )
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => d.data())
      const waits = docs.map(d => d.waitMin).filter(Boolean)
      setQueue({
        activeOrders: docs.length,
        avgWaitMin: waits.length ? Math.round(waits.reduce((a, b) => a + b, 0) / waits.length) : 0,
      })
    }, (err) => setError('Không thể tải trạng thái hàng chờ.'))
    return unsub
  }, [])

  return { ...queue, error }
}
```

### `useOrders.js`

```js
import { useEffect, useState } from 'react'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useOrders(machineNo) {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!machineNo) return
    const q = query(
      collection(db, 'orders'),
      where('machineNo', '==', Number(machineNo)),
      where('status', 'in', ['received', 'preparing', 'delivering']),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q,
      (snap) => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      (err) => setError('Không thể tải đơn hàng.')
    )
    return unsub
  }, [machineNo])

  return { orders, error }
}
```

### `useMenu.js`

```js
import { useEffect, useState } from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useMenu(category) {
  const [items, setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    getDocs(query(collection(db, 'menuItems'), orderBy('createdAt')))
      .then((snap) => {
        let docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        if (category && category !== 'all') docs = docs.filter(d => d.category === category)
        setItems(docs)
      })
      .catch(() => setError('Không thể tải menu.'))
      .finally(() => setLoading(false))
  }, [category])

  return { items, loading, error }
}
```

---

## Firestore Indexes

Compound queries require composite indexes. Create in Firebase Console → Firestore → Indexes, or click the auto-create link from the console error.

| Collection | Fields | Query |
|---|---|---|
| `orders` | `machineNo ASC`, `status ASC`, `createdAt DESC` | `useOrders` |
| `orders` | `status ASC`, `createdAt DESC` | Kitchen board |
| `orders` | `createdAt DESC` | Admin overview / reports |

---

## Design System

The `site4/` folder is the visual spec. All color, spacing, and typography decisions come from those files.

### Color Tokens

| Token | Hex | Usage |
|---|---|---|
| `primary-fixed` | `#9EFF00` | Neon green — accent, CTA, key badges only |
| `primary-fixed-dim` | `#88dc00` | Hover/dim of accent |
| `background` | `#0B0B0B` | App background |
| `surface` | `#131313` | Card background |
| `surface-container` | `#1F1F1F` | Inner card |
| `surface-container-high` | `#2A2A2A` | Borders, dividers |
| `primary` | `#ffffff` | Primary text |
| `secondary` | `#c8c6c5` | Muted text |
| `error` | `#ffb4ab` | Error text |

**Rule:** `#9EFF00` is used sparingly — only on the single most important element per screen.

### Typography

- Headlines: **Montserrat**, 700–900 weight, `uppercase`, `tracking-tight`
- Body/Labels: **Inter**, 400–700 weight
- Load via Google Fonts CDN in `index.css`

### Tailwind Config

```js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary-fixed':          '#9EFF00',
        'primary-fixed-dim':      '#88dc00',
        'primary':                '#ffffff',
        'secondary':              '#c8c6c5',
        'background':             '#0B0B0B',
        'surface':                '#131313',
        'surface-container':      '#1f1f1f',
        'surface-container-high': '#2a2a2a',
        'surface-variant':        '#353535',
        'on-surface':             '#e2e2e2',
        'on-surface-variant':     '#c0cbad',
        'error':                  '#ffb4ab',
      },
      spacing: {
        'stack-sm': '8px', 'stack-md': '16px', 'stack-lg': '24px',
        'margin-mobile': '20px', gutter: '12px',
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
      },
    },
  },
}
```

### Global CSS (`src/index.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Montserrat:wght@700;800;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

@layer base {
  html { @apply dark; }
  body { @apply bg-background text-on-surface font-sans antialiased; }
}

@layer utilities {
  .neon-glow      { box-shadow: 0 0 15px rgba(158,255,0,0.3); }
  .neon-text-glow { text-shadow: 0 0 8px rgba(158,255,0,0.8); }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
}
```

### Layout Constraints

- Phone-first: `max-w-[480px] mx-auto` — no desktop breakpoints needed
- Fixed header `h-16` → `pt-16` on body
- Fixed bottom nav `h-16` → `pb-20` on body
- Card: `bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden`

### Key UI Patterns

**Wait time badge:**
```jsx
<span className="border border-primary-fixed text-primary-fixed rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
  <span className="material-symbols-outlined text-[14px]">timer</span>
  ~{waitMin} phút
</span>
```

**Primary CTA:**
```jsx
<button className="w-full bg-primary-fixed text-black font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl neon-glow hover:bg-primary-fixed-dim transition-colors">
  ĐẶT NGAY
</button>
```

**Out-of-stock:**
```jsx
className={item.inStock ? '' : 'opacity-50 grayscale pointer-events-none'}
```

---

## Deployment Guide

### 1. Firebase Project Setup

1. Go to console.firebase.google.com → **Add project**
2. Enable **Firestore Database** (production mode)
3. Enable **Authentication** → Email/Password
4. Enable **Storage** (production mode)
5. Register a **Web app** → copy `firebaseConfig` into `.env.local`

### 2. Firebase CLI Init

```bash
firebase login
firebase init
# Select: Firestore, Hosting, Storage, Emulators
# Hosting public dir: dist
# Configure as SPA: YES
```

### 3. Deploy

```bash
firebase deploy --only firestore:rules,storage:rules   # rules first
npm run build
firebase deploy --only hosting
```

### 4. Create First Admin Account

```js
// Run once in browser console on the deployed app
const cred = await createUserWithEmailAndPassword(auth, 'manager@oeg.vn', 'strongpassword')
await setDoc(doc(db, 'profiles', cred.user.uid), { role: 'admin', name: 'Manager', createdAt: new Date() })
```

### 5. Seed Menu Items

```js
const menu = [
  { name: 'Cyber Energy Drink', category: 'drinks', price: 35000, prepMin: 10, inStock: true, isFeatured: true },
  { name: 'Neon Burger Combo',  category: 'food',   price: 85000, prepMin: 15, inStock: true, isFeatured: true },
  { name: 'Crispy Wings',       category: 'food',   price: 65000, prepMin: 15, inStock: true, isFeatured: false },
  { name: 'Gaming Combo',       category: 'combo',  price: 110000, prepMin: 20, inStock: true, isFeatured: false },
]
for (const item of menu) {
  await addDoc(collection(db, 'menuItems'), { ...item, imageUrl: '', createdAt: Timestamp.now() })
}
```

### 6. Post-Deployment Checklist

- [ ] Customer enters machine number and reaches Home screen
- [ ] Menu items load from Firestore
- [ ] Placing an order creates a document in `orders`
- [ ] Kitchen `/admin/orders` shows new order in real-time + plays sound
- [ ] Staff advances status: received → preparing → delivering → done
- [ ] Customer toast fires on each status change
- [ ] Browser notification fires when customer tab is not focused
- [ ] Admin toggles `inStock` → item immediately hides for customers
- [ ] Image upload works from `/admin/menu/new`
- [ ] `/admin` redirects to `/admin/login` when not authenticated
- [ ] Firestore Rules Playground: anon write to `menuItems` → denied

---

## Coding Conventions

- **No TypeScript** — plain JS for accessibility within the student group
- **No Redux** — CartContext + `useState` is sufficient
- **Firebase imports:** modular SDK only (`firebase/auth`, `firebase/firestore`) — never compat mode
- **Single init:** `src/lib/firebase.js` exports `auth`, `db`, `storage` — import from there everywhere
- **Machine number:** `localStorage.getItem('machineNo')` — prompt on first visit, parse to `Number()` before Firestore queries
- **Realtime cleanup:** every `onSnapshot` returns an unsubscribe — always return it from `useEffect`
- **Timestamps:** use `serverTimestamp()` for all `createdAt`/`updatedAt` writes, never `new Date()`
- **Errors:** write operations → `toast.error(...)` in the catch block; read operations → `setError(msg)` in hook, render inline in component
- **Loading states:** every data-dependent component must show `<Spinner />` while loading and an error message on failure — no blank screens
- **Notifications:** `useOrderNotifications` is used in `Orders.jsx`; `useNewOrderAlert` is used in `admin/Orders.jsx` — do not duplicate this logic inline
- **Icons:** `<span className="material-symbols-outlined">icon_name</span>` via Google Fonts CDN
