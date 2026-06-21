---
description: Admin and kitchen dashboard pages, routes, Kanban order board, and status transitions
globs: ["**/admin/**", "**/pages/admin*"]
alwaysApply: false
---

# Admin / Kitchen Dashboard

Route tree under `/admin` — desktop-optimized, **no** `max-w-[480px]` phone-wrap.

## Routes & Access

| Route | Role | Purpose |
|---|---|---|
| `/admin/login` | everyone | Email + password sign-in |
| `/admin` | admin | KPI overview: revenue, order count, avg wait |
| `/admin/orders` | kitchen, admin | Live Kanban board — advance order status |
| `/admin/menu` | admin | Item list + inline `inStock` toggle |
| `/admin/menu/new` | admin | Create item + Firebase Storage image upload |
| `/admin/menu/:id` | admin | Edit item |
| `/admin/reports` | admin | Daily order history + revenue chart |

## Kitchen Board Layout (`/admin/orders`)

Three columns, updated by Firestore `onSnapshot` — no page refresh needed.

```
┌──────────────────────────────────────────────────┐
│  RECEIVED (3)     PREPARING (2)   DELIVERING (1) │
│  ─────────────    ─────────────   ────────────── │
│  [OrderCard]      [OrderCard]     [OrderCard]    │
│  [OrderCard]      [OrderCard]                    │
│  [OrderCard]                                     │
└──────────────────────────────────────────────────┘
```

Each `OrderCard` displays: machine number, item list, elapsed time since `createdAt`, and action buttons.

`useNewOrderAlert` is always active on this page — import and call it at the top of `admin/Orders.jsx`.

## Status Transitions

Staff can only advance forward or cancel. No going backward.

```
received → preparing → delivering → done
    ↓           ↓
cancelled   cancelled
```

Implement as `updateDoc(doc(db, 'orders', id), { status: nextStatus, updatedAt: serverTimestamp() })`.

Show a confirmation dialog before cancelling a `preparing` or `delivering` order.

## Admin Overview (`/admin`)

- 4 KPI stat cards at the top
- Table of last 50 orders below, ordered by `createdAt DESC`
- KPIs computed client-side from the same `onSnapshot` that drives the table

## Menu Management (`/admin/menu`)

- Table with inline `inStock` toggle → `updateDoc` immediately on toggle, no save button
- Edit button → `/admin/menu/:id`
- Image upload flow: `uploadBytes(ref(storage, 'menu-images/${uuid}'), file)` → `getDownloadURL` → save URL to `menuItems` document

## `waitMin` on Orders

Kitchen staff set the estimated wait time when accepting an order (moving from `received` → `preparing`). Show an input field or quick-select buttons (5 / 10 / 15 / 20 min) in the OrderCard action area. This value drives the `WaitTimeBadge` and `useQueue` average on the customer side.
