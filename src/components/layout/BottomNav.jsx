import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/',       icon: 'home',         label: 'Trang chủ' },
  { to: '/store',  icon: 'storefront',   label: 'Menu' },
  { to: '/orders', icon: 'receipt_long', label: 'Đơn hàng' },
  { to: '/esports',icon: 'sports_esports',label: 'Esports' },
  { to: '/quests', icon: 'star',         label: 'Quests' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 max-w-[480px] mx-auto h-16 flex items-center bg-surface border-t border-surface-container-high px-2">
      {NAV.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 gap-0.5 py-2 transition-colors ${isActive ? 'text-primary-fixed' : 'text-secondary hover:text-on-surface'}`
          }
        >
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
          <span className="text-[9px] uppercase tracking-wider font-bold">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
