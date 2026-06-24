import { NavLink, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { useAuth } from '../../hooks/useAuth'

// Mỗi mục khai báo roles được phép — kitchen chỉ thấy mục của mình, ẩn các trang
// admin-only để không bấm vào trang bị RequireAuth chặn.
const ITEMS = [
  { to: '/admin',          end: true,  icon: 'dashboard',    label: 'Tổng quan', roles: ['admin'] },
  { to: '/admin/orders',   end: false, icon: 'receipt_long', label: 'Bảng đơn',  roles: ['admin', 'kitchen'] },
  { to: '/admin/menu',     end: false, icon: 'restaurant_menu', label: 'Menu',   roles: ['admin'] },
  { to: '/admin/requests', end: false, icon: 'room_service', label: 'Yêu cầu',   roles: ['admin', 'kitchen'] },
  { to: '/admin/reviews',  end: false, icon: 'reviews',      label: 'Đánh giá',  roles: ['admin', 'kitchen'] },
  { to: '/admin/reports',  end: false, icon: 'bar_chart',    label: 'Báo cáo',   roles: ['admin'] },
]

export default function AdminNav() {
  const { role } = useAuth()
  const navigate = useNavigate()

  const items = ITEMS.filter((item) => item.roles.includes(role))

  async function handleLogout() {
    try {
      await signOut(auth)
    } catch (e) {
      console.error(e)
    }
    navigate('/admin/login', { replace: true })
  }

  return (
    <nav className="sticky top-0 z-30 bg-surface border-b border-surface-container-high">
      <div className="flex items-center gap-1 px-3 py-2 overflow-x-auto hide-scrollbar">
        <span className="font-display font-black text-sm uppercase tracking-tight text-primary neon-text-glow shrink-0 pr-2">
          OEG Admin
        </span>

        {items.map(({ to, end, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors ${
                isActive
                  ? 'bg-surface-container text-primary-fixed'
                  : 'text-secondary hover:text-on-surface hover:bg-surface-container'
              }`
            }
          >
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
            {label}
          </NavLink>
        ))}

        <button
          onClick={handleLogout}
          className="shrink-0 ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold uppercase tracking-wider text-error hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Đăng xuất
        </button>
      </div>
    </nav>
  )
}
