---
description: Authentication flow, role system, useAuth hook, and RequireAuth route guard
globs: ["**/hooks/useAuth*", "**/RequireAuth*", "**/admin/**", "**/Login*"]
alwaysApply: false
---

# Auth & Roles

## Role System

| Role | Who | Authentication |
|---|---|---|
| `anon` | Customers at any machine | No Firebase Auth — machine number in `localStorage` |
| `kitchen` | Kitchen / front-of-house staff | Firebase Auth email/password |
| `admin` | Manager / owner | Firebase Auth email/password + `role = 'admin'` in `profiles/{uid}` |

## Customer (Anonymous) Flow

Customers never log in. On first visit, show a `MachineModal` to collect machine number → save to `localStorage('machineNo')`.

```
App loads
  └─ localStorage has machineNo?
       ├─ YES → proceed to Home
       └─ NO  → MachineModal → save → proceed
```

## Staff / Admin Login Flow

```
/admin visited
  └─ onAuthStateChanged fires with user?
       ├─ YES → getDoc(profiles/{uid}) → check role
       │          ├─ 'kitchen' → redirect /admin/orders
       │          └─ 'admin'   → stay on /admin
       └─ NO  → redirect /admin/login
                  └─ signInWithEmailAndPassword(auth, email, password)
                       ├─ success → navigate to /admin
                       └─ error   → getAuthError(err.code) → inline field error
```

Session is persisted in `IndexedDB` by the Firebase SDK — no manual token handling.

## `useAuth` Hook

```js
// src/hooks/useAuth.js
import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

export function useAuth() {
  const [user, setUser]       = useState(undefined) // undefined = still loading
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

`user === undefined` means the auth state has not resolved yet — render `<Spinner />`, not a redirect.

## `RequireAuth` Guard

```jsx
// src/components/layout/RequireAuth.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Spinner from '../ui/Spinner'

export default function RequireAuth({ children, allowedRoles }) {
  const { user, role, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user)   return <Navigate to="/admin/login" replace />
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/admin" replace />
  return children
}
```

Usage in `App.jsx`:
```jsx
<Route path="/admin/orders" element={
  <RequireAuth allowedRoles={['kitchen','admin']}><AdminOrders /></RequireAuth>
} />
<Route path="/admin/menu" element={
  <RequireAuth allowedRoles={['admin']}><Menu /></RequireAuth>
} />
```

## Auth Error Codes → Vietnamese

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

## Creating Staff Accounts

All staff accounts are created manually — there is no self-registration UI.

```js
// Run once in browser console or a one-off script
const cred = await createUserWithEmailAndPassword(auth, 'staff@oeg.vn', 'password')
await setDoc(doc(db, 'profiles', cred.user.uid), {
  role: 'kitchen',   // or 'admin' for managers
  name: 'Staff Name',
  createdAt: serverTimestamp(),
})
```
