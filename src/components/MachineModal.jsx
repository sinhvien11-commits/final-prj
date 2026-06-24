import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCart } from '../context/CartContext'
import Button from './ui/Button'
import LanguageToggle from './layout/LanguageToggle'

export default function MachineModal() {
  const { t } = useTranslation()
  const { machineNo, saveMachineNo } = useCart()
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  if (machineNo) return null

  function handleSubmit(e) {
    e.preventDefault()
    const num = Number(input)
    if (!input || isNaN(num) || num < 1) {
      setError(t('machine.invalid'))
      return
    }
    saveMachineNo(num)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-5">
      <div className="w-full max-w-sm bg-surface border border-surface-container-high rounded-2xl p-6 flex flex-col gap-5">
        <div className="flex justify-end">
          <LanguageToggle />
        </div>
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-primary-fixed">videogame_asset</span>
          <h2 className="font-display font-bold text-xl uppercase tracking-tight text-primary mt-2">
            {t('machine.appName')}
          </h2>
          <p className="text-secondary text-sm mt-1">{t('machine.prompt')}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="number"
            inputMode="numeric"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError('') }}
            placeholder={t('machine.placeholder')}
            className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-3 text-primary text-center text-xl font-bold focus:outline-none focus:border-primary-fixed"
            min="1"
          />
          {error && <p className="text-error text-xs text-center">{error}</p>}
          <Button type="submit">{t('machine.confirm')}</Button>
        </form>
      </div>
    </div>
  )
}
