import { useState } from 'react'
import { useCart } from '../context/CartContext'
import Button from './ui/Button'

export default function MachineModal() {
  const { machineNo, saveMachineNo } = useCart()
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  if (machineNo) return null

  function handleSubmit(e) {
    e.preventDefault()
    const num = Number(input)
    if (!input || isNaN(num) || num < 1) {
      setError('Vui lòng nhập số máy hợp lệ.')
      return
    }
    saveMachineNo(num)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-5">
      <div className="w-full max-w-sm bg-surface border border-surface-container-high rounded-2xl p-6 flex flex-col gap-5">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-primary-fixed">videogame_asset</span>
          <h2 className="font-display font-bold text-xl uppercase tracking-tight text-primary mt-2">
            OEG Cyber Hub
          </h2>
          <p className="text-secondary text-sm mt-1">Nhập số máy của bạn để bắt đầu</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="number"
            inputMode="numeric"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError('') }}
            placeholder="Số máy (VD: 42)"
            className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-3 text-primary text-center text-xl font-bold focus:outline-none focus:border-primary-fixed"
            min="1"
          />
          {error && <p className="text-error text-xs text-center">{error}</p>}
          <Button type="submit">XÁC NHẬN</Button>
        </form>
      </div>
    </div>
  )
}
