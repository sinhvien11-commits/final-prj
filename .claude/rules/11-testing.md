---
description: Testing setup with Vitest, Firebase Emulator Suite, test examples, and manual QA checklist
globs: ["**/*.test.*", "**/*.spec.*", "**/test/**"]
alwaysApply: false
---

# Testing / QA

## Framework

- **Unit/integration:** Vitest + React Testing Library
- **Firebase security rules:** Firebase Emulator Suite (`firebase emulators:start`)
- **Manual QA:** Firebase Emulator UI at `localhost:4000`

## Vitest Config (`vite.config.js`)

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

## Priority: What to Test

Test in this order — highest value first:

### 1. `useOrderNotifications` — bidirectional notification logic

```js
// src/hooks/useOrderNotifications.test.js
import { renderHook } from '@testing-library/react'
import { useOrderNotifications } from './useOrderNotifications'
import toast from 'react-hot-toast'

vi.mock('react-hot-toast')

const order = (id, status) => ({ id, machineNo: 1, status, items: [] })

test('fires toast on status transition to delivering', () => {
  const { rerender } = renderHook(({ orders }) => useOrderNotifications(orders), {
    initialProps: { orders: [order('a', 'preparing')] },
  })
  rerender({ orders: [order('a', 'delivering')] })
  expect(toast).toHaveBeenCalledWith(
    expect.stringContaining('đường giao'),
    expect.objectContaining({ icon: '🛵' })
  )
})

test('does NOT fire on initial load', () => {
  renderHook(() => useOrderNotifications([order('a', 'received')]))
  expect(toast).not.toHaveBeenCalled()
})

test('does NOT fire when status is unchanged', () => {
  const { rerender } = renderHook(({ orders }) => useOrderNotifications(orders), {
    initialProps: { orders: [order('a', 'preparing')] },
  })
  rerender({ orders: [order('a', 'preparing')] })
  expect(toast).not.toHaveBeenCalled()
})
```

### 2. `MenuCard` — core product display

```js
// src/components/menu/MenuCard.test.jsx
import { render, screen } from '@testing-library/react'
import MenuCard from './MenuCard'

const item = { id: '1', name: 'Neon Burger', price: 85000, prepMin: 15, inStock: true, imageUrl: '' }

test('shows name and price', () => {
  render(<MenuCard item={item} onAdd={() => {}} />)
  expect(screen.getByText('Neon Burger')).toBeInTheDocument()
  expect(screen.getByText('85,000 đ')).toBeInTheDocument()
})

test('add button disabled when out of stock', () => {
  render(<MenuCard item={{ ...item, inStock: false }} onAdd={() => {}} />)
  expect(screen.getByRole('button', { name: /thêm/i })).toBeDisabled()
})
```

### 3. `authErrors` — Vietnamese error messages

```js
// src/lib/authErrors.test.js
import { getAuthError } from './authErrors'

test('maps known code', () => {
  expect(getAuthError('auth/wrong-password')).toBe('Sai mật khẩu.')
})
test('returns fallback for unknown code', () => {
  expect(getAuthError('auth/unknown-code')).toMatch(/thử lại/)
})
```

## Firestore Security Rules Testing

```bash
npm install -D @firebase/rules-unit-testing
firebase emulators:start --only firestore,auth
```

```js
// src/test/firestore.rules.test.js
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore'

let testEnv
beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-oeg',
    firestore: { host: 'localhost', port: 8080 },
  })
})
afterAll(() => testEnv.cleanup())

test('anon can create order', async () => {
  const db = testEnv.unauthenticatedContext().firestore()
  await assertSucceeds(
    addDoc(collection(db, 'orders'), { machineNo: 1, status: 'received', items: [], total: 0 })
  )
})

test('anon cannot update order', async () => {
  const db = testEnv.unauthenticatedContext().firestore()
  await assertFails(updateDoc(doc(db, 'orders', 'fake-id'), { status: 'preparing' }))
})

test('anon cannot write to menuItems', async () => {
  const db = testEnv.unauthenticatedContext().firestore()
  await assertFails(addDoc(collection(db, 'menuItems'), { name: 'test' }))
})
```

## Manual QA Checklist (run before every deploy)

- [ ] New order appears on kitchen board within 2 seconds (no refresh)
- [ ] Kitchen plays `new-order.mp3` sound when order arrives
- [ ] Customer receives toast notification when status changes to `delivering`
- [ ] Browser notification fires when customer tab is not focused (requires permission)
- [ ] Sound plays on each status transition
- [ ] Out-of-stock item is visually dimmed and unclickable for customers
- [ ] Cart total updates correctly when items are added and removed
- [ ] Setting `inStock: false` in admin immediately hides item for customers
- [ ] Firestore Rules Playground: anonymous write to `menuItems` → denied
- [ ] `/admin` route redirects to `/admin/login` when not authenticated
