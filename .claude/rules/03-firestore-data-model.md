---
description: Firestore collection schema, ERD, and required composite indexes
globs: ["**/*.js", "**/*.jsx", "firestore.rules"]
alwaysApply: false
---

# Firestore Data Model

## Collections

```
firestore/
├── menuItems/{itemId}
│   ├── name         string
│   ├── category     string   "food" | "drinks" | "combo"
│   ├── price        number   VND
│   ├── prepMin      number   minutes
│   ├── imageUrl     string   Firebase Storage download URL
│   ├── inStock      boolean
│   ├── isFeatured   boolean
│   └── createdAt    timestamp  ← always use serverTimestamp()
│
├── orders/{orderId}
│   ├── machineNo    number   anonymous customer identifier
│   ├── items        array    [{ id, name, qty, price }]  ← denormalized snapshot
│   ├── total        number   VND
│   ├── status       string   "received"|"preparing"|"delivering"|"done"|"cancelled"
│   ├── waitMin      number   set by kitchen staff on accept
│   ├── note         string
│   ├── createdAt    timestamp
│   └── updatedAt    timestamp
│
└── profiles/{uid}
    ├── role         string   "kitchen" | "admin"
    ├── name         string
    └── createdAt    timestamp
```

## Key Design Decisions

- `orders.items` is a **denormalized array** (price snapshot at order time) — changing menu prices later does not corrupt history
- Customers are **fully anonymous** — identified only by `machineNo`, no Firebase Auth required
- `profiles` documents use the Firebase Auth **UID as document ID** — no extra join needed
- There is no equivalent to SQL views in Firestore — `queue_summary` is computed client-side in `useQueue`

## ERD

```
Firebase Auth User (uid)
        │ doc ID = uid
        ▼
profiles/{uid}  ──  role: "kitchen" | "admin"


menuItems/{itemId}
        │ id referenced inside orders.items[] (denormalized, no FK)
        ▼
orders/{orderId}  ──  machineNo (anonymous, no FK to any user)
```

## Composite Indexes Required

Create in Firebase Console → Firestore → Indexes (or click the auto-create link from the error).

| Collection | Field 1 | Field 2 | Field 3 | Used in |
|---|---|---|---|---|
| `orders` | `machineNo ASC` | `status ASC` | `createdAt DESC` | `useOrders` |
| `orders` | `status ASC` | `createdAt DESC` | — | Kitchen board |
| `orders` | `createdAt DESC` | — | — | Admin reports |

## Timestamps

Always use `serverTimestamp()` from `firebase/firestore` for writes — never `new Date()`.

```js
import { serverTimestamp } from 'firebase/firestore'

await addDoc(collection(db, 'orders'), {
  ...orderData,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
})
```
