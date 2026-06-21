import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import TopAppBar from '../components/layout/TopAppBar'

function fmt(secs) {
  const h = String(Math.floor(secs / 3600)).padStart(2, '0')
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0')
  const s = String(secs % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

export default function Esports() {
  const { machineNo } = useCart()
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setElapsed((p) => p + 1), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <TopAppBar title="Esports" />
      <div className="pt-16 pb-20 px-4 flex flex-col gap-4 mt-3">

        <div className="bg-surface border border-surface-container-high rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-xs uppercase tracking-wider">Vị trí của bạn</p>
              <p className="font-display font-black text-2xl text-primary mt-0.5">
                Ghế {machineNo ? `A${machineNo}` : '—'}
              </p>
            </div>
            <Badge variant="live">ĐANG CHƠI</Badge>
          </div>

          <div className="bg-surface-container rounded-xl p-4 text-center">
            <p className="text-secondary text-xs uppercase tracking-wider mb-1">Thời gian đã chơi</p>
            <p className="font-display font-black text-4xl text-primary-fixed neon-text-glow tracking-wider">
              {fmt(elapsed)}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="primary">GIA HẠN THÊM GIỜ</Button>
            <Button variant="ghost">GỌI HỖ TRỢ KỸ THUẬT</Button>
          </div>
        </div>

        <div className="bg-surface border border-surface-container-high rounded-xl p-4">
          <h3 className="font-display font-bold text-sm uppercase tracking-wider text-primary mb-3">
            Thống kê phiên
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'FPS TB', value: '144' },
              { label: 'Ping', value: '4ms' },
              { label: 'KDA', value: '8.2' },
              { label: 'Rank', value: 'Diamond' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-surface-container rounded-lg p-3 text-center">
                <p className="text-secondary text-xs">{label}</p>
                <p className="text-primary font-bold text-sm mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  )
}
