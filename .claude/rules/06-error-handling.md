---
description: Error handling conventions — where to catch, toast vs inline, ErrorBoundary, loading states
alwaysApply: true
---

# Error Handling

## Where Errors Are Caught

| Source | Handler | UI |
|---|---|---|
| Firestore reads (`getDocs`, `onSnapshot`) | Hook-level `catch` / `onError` callback | `setError(msg)` → render inline in component |
| Firestore writes (`addDoc`, `updateDoc`) | Event handler `try/catch` | `toast.error(msg)` |
| Firebase Auth (`signInWithEmailAndPassword`) | Login form `try/catch` | `getAuthError(err.code)` → inline field error |
| Image upload (`uploadBytes`) | MenuEdit `try/catch` | `toast.error(msg)` |
| Page-level JS crash | `<ErrorBoundary>` | Full-page fallback with reload button |

Never call `toast.error` inside a `useEffect` — only in event handlers.

## Toast Pattern (write operations)

```js
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

## Inline Error State (hooks)

```js
// Inside hook
const [error, setError] = useState(null)

const unsub = onSnapshot(q,
  (snap) => { setItems(snap.docs.map(...)) },
  (err)  => { setError('Không thể tải dữ liệu.'); console.error(err) }
)

// Inside component — always check before render
if (loading) return <Spinner />
if (error)   return <p className="text-error text-center py-8">{error}</p>
return <ActualContent />
```

Every hook that fetches data must return `{ ..., error }`. Every component that uses such a hook must render the error.

## Firebase Auth Error Codes

```js
// src/lib/authErrors.js
export const AUTH_ERRORS = {
  'auth/user-not-found':         'Email không tồn tại.',
  'auth/wrong-password':         'Sai mật khẩu.',
  'auth/too-many-requests':      'Quá nhiều lần thử. Vui lòng đợi.',
  'auth/network-request-failed': 'Lỗi kết nối mạng.',
}

export function getAuthError(code) {
  return AUTH_ERRORS[code] ?? 'Đã có lỗi xảy ra. Vui lòng thử lại.'
}
```

## ErrorBoundary

```jsx
// src/components/layout/ErrorBoundary.jsx
import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }

  render() {
    if (this.state.hasError) return (
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
    return this.props.children
  }
}
```

Wrap each route in `App.jsx`:
```jsx
<Route path="/" element={<ErrorBoundary><Home /></ErrorBoundary>} />
```

## Loading States Rule

Every data-dependent component **must** show `<Spinner />` while loading — never a blank screen. Order: loading check → error check → render content.
