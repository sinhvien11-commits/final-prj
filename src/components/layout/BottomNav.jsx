import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const NAV = [
  { to: '/',       icon: 'home',         key: 'home' },
  { to: '/store',  icon: 'storefront',   key: 'menu' },
  { to: '/orders', icon: 'receipt_long', key: 'orders' },
  { to: '/esports',icon: 'sports_esports',key: 'esports' },
  { to: '/quests', icon: 'star',         key: 'quests' },
]

export default function BottomNav() {
  const { t } = useTranslation()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 max-w-[480px] mx-auto h-16 flex items-center bg-surface border-t border-surface-container-high px-2">
      {NAV.map(({ to, icon, key }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 gap-0.5 py-2 transition-colors ${isActive ? 'text-primary-fixed' : 'text-secondary hover:text-on-surface'}`
          }
        >
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
          <span className="text-[9px] uppercase tracking-wider font-bold">{t(`nav.${key}`)}</span>
        </NavLink>
      ))}
    </nav>
  )
}
