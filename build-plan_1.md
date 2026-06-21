# Build Plan — OEG Cyber Hub F&B Queue App

Build tuần tự từ trên xuống. **Mỗi slice phải pass cổng kiểm chứng trước khi sang slice tiếp.**

## Cổng kiểm chứng (chạy sau MỖI slice)
- [ ] `npm run test:run` → xanh
- [ ] `npm run build` → không lỗi
- [ ] (slice có rules) `firebase emulators:start` + rules-unit-testing → xanh
- [ ] commit: `git commit -m "slice N: <tên>"`

Đỏ thì tự sửa, KHÔNG đánh dấu `[x]` và KHÔNG sang slice tiếp.

---

## Giai đoạn A — Nền móng (không có thì không gì chạy)

### Slice 1 — Scaffold + Firebase init
- [ ] `npm create vite` (template react) + install deps theo `01-stack-and-commands`
- [ ] `tailwind.config.js` đầy đủ color tokens + fonts (theo `09-design-system`)
- [ ] `src/index.css` (Tailwind layers + Google Fonts + neon utilities)
- [ ] `src/lib/firebase.js` — single init, export `auth/db/storage`, có nhánh emulator
- [ ] `App.jsx` shell: Router + `<Toaster>` + `<ErrorBoundary>` bọc route
- [ ] `.env.local` mẫu + `VITE_USE_EMULATORS=true`
- **Gate:** `npm run dev` mở được trang trắng có router.

### Slice 2 — Security rules + indexes + seed (LÀM TRƯỚC tính năng)
- [ ] `firestore.rules` theo `08-security-rules`, **kèm 3 fix:**
  - [ ] `profiles`: non-admin KHÔNG đổi được field `role` (chặn self-promote)
  - [ ] `orders` create: validate `status == 'received'` + kiểu dữ liệu các field
  - [ ] (tùy chọn) cân nhắc giới hạn `orders` read thay vì `if true`
- [ ] `storage.rules`: chỉ admin upload ảnh menu (khớp capability matrix)
- [ ] Composite indexes theo `03-firestore-data-model`
- [ ] Script seed `menuItems` + tạo 1 admin account
- **Gate:** rules-unit-testing pass: anon tạo order OK, anon đổi status FAIL, kitchen tự set role admin FAIL.

### Slice 3 — UI primitives (mọi thứ phụ thuộc)
- [ ] `ui/Button` (primary/secondary/ghost) · `ui/Card` · `ui/Badge` · `ui/ProgressBar` · `ui/Spinner`
- **Gate:** test render cơ bản cho Button + Badge.

---

## Giai đoạn B — Vertical slices: Khách hàng

### Slice 4 — Machine number flow
- [ ] `CartContext` (items, total, machineNo)
- [ ] `MachineModal` — hiện khi `localStorage('machineNo')` rỗng, lưu lại
- **Gate:** vào app lần đầu hiện modal, nhập số máy → vào Home.

### Slice 5 — Menu + Cart
- [ ] `useMenu.js` · `MenuCard` · `CategoryFilter` · `CartDrawer`
- [ ] `pages/Store.jsx` ráp lại
- [ ] Out-of-stock: dimmed + không click được
- **Gate:** test MenuCard (hiện tên/giá, disable khi hết hàng) + thêm/xoá giỏ cập nhật total.

### Slice 6 — Đặt hàng
- [ ] `useOrders(machineNo)` — onSnapshot, return unsubscribe
- [ ] `addDoc('orders')` với `serverTimestamp()`, try/catch + `toast`
- [ ] `pages/Orders.jsx` · `OrderTracker` · `OrderStepper`
- **Gate:** đặt hàng tạo doc trong emulator, Orders hiện đúng đơn theo máy.

### Slice 7 — Notification phía khách (dễ bug nhất)
- [ ] `useOrderNotifications` — **bỏ qua snapshot đầu**, map transition → toast/sound
- [ ] Xin `Notification.requestPermission()` trong `App.jsx`
- [ ] File âm thanh trong `public/sounds/`
- **Gate:** test có toast khi đổi sang `delivering`, KHÔNG toast lúc load đầu.

---

## Giai đoạn C — Vertical slices: Admin / Bếp

### Slice 8 — Auth
- [ ] `useAuth` (onAuthStateChanged + fetch role) · `RequireAuth` · `lib/authErrors.js`
- [ ] `pages/admin/Login.jsx`
- **Gate:** test authErrors mapping · `/admin` chưa login → redirect `/admin/login`.

### Slice 9 — Kitchen Board
- [ ] `pages/admin/Orders.jsx` — Kanban 3 cột, advance status qua `updateDoc`
- [ ] `useNewOrderAlert` — sound khi có đơn mới (bỏ qua load đầu)
- **Gate:** đơn mới hiện ở cột RECEIVED realtime + kêu chuông; advance status chạy đúng.

### Slice 10 — Menu management
- [ ] `pages/admin/Menu.jsx` (toggle inStock) · `MenuEdit` · upload ảnh Storage
- **Gate:** toggle inStock → khách thấy ẩn ngay; upload ảnh OK.

### Slice 11 — Overview + Reports
- [ ] `pages/admin/Overview.jsx` (4 KPI) · `pages/admin/Reports.jsx`
- **Gate:** số liệu khớp dữ liệu seed.

---

## Giai đoạn D — Trang phụ + hoàn thiện

### Slice 12 — Các trang còn lại
- [ ] `Home` · `Esports` · `Quests` · `Review` (theo `10-prototype-mapping`)

### Slice 13 — Test + QA cuối
- [ ] Chạy full Manual QA Checklist trong `11-testing`
- [ ] Post-Deployment Checklist
- **Gate:** toàn bộ checklist trong `11-testing` xanh.

---

## Quy tắc xuyên suốt
- Một slice = một đơn vị làm việc. Không gộp code tính năng với sửa rules.
- `/memory` đầu mỗi phiên để xác nhận đúng rule files đã load.
- Code hook trong các file rules chỉ là **mẫu tham khảo**, không phải nguồn chân lý — nguồn chân lý là `src/`.
