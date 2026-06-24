import { useTranslation } from 'react-i18next'
import { useSound } from '../../context/SoundContext'

// Nút bật/tắt chuông (dùng chung cho màn khách & bảng bếp). Bấm vừa toggle soundOn vừa
// unlockAudio (qua SoundContext.toggle). Chuông gạch chéo khi tắt.
export default function SoundToggle() {
  const { t } = useTranslation()
  const { soundOn, toggle } = useSound()
  const label = soundOn ? t('sound.mute') : t('sound.unmute')

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={soundOn}
      aria-label={label}
      title={label}
      className={`w-8 h-8 rounded-full flex items-center justify-center border border-surface-container-high bg-surface-container transition-colors ${
        soundOn ? 'text-primary-fixed' : 'text-secondary hover:text-on-surface'
      }`}
    >
      <span className="material-symbols-outlined text-[18px]">
        {soundOn ? 'notifications' : 'notifications_off'}
      </span>
    </button>
  )
}
