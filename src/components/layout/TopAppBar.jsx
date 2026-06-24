import LanguageToggle from './LanguageToggle'
import SoundToggle from './SoundToggle'

export default function TopAppBar({ title, actions }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 max-w-[480px] mx-auto h-16 flex items-center justify-between px-4 bg-background/90 backdrop-blur-md border-b border-surface-container-high">
      <span className="font-display font-black text-sm uppercase tracking-tight text-primary neon-text-glow">
        {title ?? 'OEG Cyber Hub'}
      </span>
      <div className="flex items-center gap-2">
        {actions}
        <SoundToggle />
        <LanguageToggle />
      </div>
    </header>
  )
}
