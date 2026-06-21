---
description: Mapping from site4/ HTML prototype files to React pages and components — use as visual spec
globs: ["**/pages/**", "**/components/**"]
alwaysApply: false
---

# Prototype → React Component Mapping

Each file in `site4/` is the **visual spec** for its corresponding React page. When building a component, open the matching HTML file to see exact colors, spacing, and interaction patterns.

## `site4/index.html` → `App.jsx` + `components/layout/`

| HTML element | React equivalent |
|---|---|
| `.phone-wrap` max-width div | `<div className="max-w-[480px] mx-auto">` in `App.jsx` |
| `<nav class="bottom-nav">` | `components/layout/BottomNav.jsx` |
| `iframe.src = btn.dataset.src` routing | React Router `<Routes>` + `<NavLink>` |
| Active tab `#9EFF00` highlight | `NavLink` `className` with active state |

## `site4/05-home.html` → `pages/Home.jsx`

| HTML element | React component |
|---|---|
| Facility card (`rounded-[20px]`, dark bg) | `components/ui/Card.jsx` |
| "ĐANG MỞ CỬA" pulsing dot + pill | `components/ui/Badge.jsx` variant="live" |
| "Tỷ lệ lấp đầy: 87%" + neon progress bar | `components/ui/ProgressBar.jsx` |
| Queue occupancy + avg wait stats | `components/queue/QueueStatusWidget.jsx` |
| "XEM THÔNG TIN" / "XEM BẢN ĐỒ" buttons | `components/ui/Button.jsx` primary / ghost |
| "PING HỆ THỐNG: 4ms" | Inline stat in `QueueStatusWidget` |

## `site4/02-store.html` → `pages/Store.jsx`

| HTML element | React component |
|---|---|
| Active order widget (top of page) | `components/order/OrderTracker.jsx` |
| 3-dot progress track + step labels | `components/order/OrderStepper.jsx` |
| "~12 phút" border pill | `components/queue/WaitTimeBadge.jsx` |
| Horizontal category chips | `components/menu/CategoryFilter.jsx` |
| Product card (image + name + time + price) | `components/menu/MenuCard.jsx` |
| "Hết hàng" overlay (grayscale, dim) | State on `MenuCard` — `opacity-50 grayscale pointer-events-none` |
| Floating cart + slide-up sheet | `components/menu/CartDrawer.jsx` |

## `site4/03-esports.html` → `pages/Esports.jsx`

| HTML element | React component |
|---|---|
| "ĐANG CHƠI" pulsing pill | `components/ui/Badge.jsx` variant="live" |
| "Ghế A12" + countdown timer (02:38:22) | Inline in `Esports.jsx` with `setInterval` |
| "GIA HẠN THÊM GIỜ" button | `components/ui/Button.jsx` variant="primary" |
| "GỌI HỖ TRỢ KỸ THUẬT" button | `components/ui/Button.jsx` variant="ghost" |

## `site4/04-quests.html` → `pages/Quests.jsx`

| HTML element | React component |
|---|---|
| "THÀNH VIÊN VÀNG" points card (bento grid) | Inline section in `Quests.jsx` |
| "ĐỔI VOUCHER" button | `components/ui/Button.jsx` |
| Daily task list header + countdown timer | Inline in `Quests.jsx` |
| Task card (icon + name + progress + pts) | `components/quests/TaskCard.jsx` |
| Completed task (strikethrough + check) | State variant on `TaskCard` |
| Progress bar inside task | `components/ui/ProgressBar.jsx` |

## `site4/01-review.html` → `pages/Review.jsx`

| HTML element | React component |
|---|---|
| Full-screen blurred backdrop | `bg-black/70 backdrop-blur-md` fixed overlay |
| Glass panel modal (`glass-panel` CSS class) | `components/ui/Modal.jsx` or inline card |
| Emoji row (5 buttons, filter:grayscale inactive) | Inline `EmojiRating` in `Review.jsx` |
| Textarea with `cyber-input` focus glow | Inline `<textarea>` with matching Tailwind classes |
| "GỬI ĐÁNH GIÁ" + shine animation | `components/ui/Button.jsx` + `@keyframes shine` |
| "GIẢM 10%" reward incentive text | Inline in `Review.jsx` |

## Component Reuse Rules

- `ProgressBar` is used in both `QueueStatusWidget` (occupancy) and `TaskCard` (quest progress) — same component, different props
- `Badge` variant="live" (pulsing dot) is shared between `Home` and `Esports`
- `WaitTimeBadge` is used in `Store` (active order) and `QueueStatusWidget` — extract once, import everywhere
