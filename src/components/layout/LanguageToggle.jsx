import { useTranslation } from 'react-i18next'

// Nút chuyển ngôn ngữ VI / EN cho màn khách. Đổi là cả màn khách đổi ngay,
// không cần reload (i18next.changeLanguage cập nhật mọi component đang dùng t()).
export default function LanguageToggle() {
  const { i18n, t } = useTranslation()
  const current = i18n.language?.startsWith('en') ? 'en' : 'vi'

  return (
    <div
      className="flex items-center rounded-full border border-surface-container-high bg-surface-container overflow-hidden text-[11px] font-bold"
      role="group"
      aria-label={t('lang.switch')}
    >
      {['vi', 'en'].map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => i18n.changeLanguage(lng)}
          aria-pressed={current === lng}
          className={`px-2.5 py-1 uppercase tracking-wider transition-colors ${
            current === lng
              ? 'bg-primary-fixed text-black'
              : 'text-secondary hover:text-on-surface'
          }`}
        >
          {t(`lang.${lng}`)}
        </button>
      ))}
    </div>
  )
}
