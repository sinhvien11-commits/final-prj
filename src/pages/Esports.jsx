import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'
import { useCart } from '../context/CartContext'
import { db } from '../lib/firebase'
import { useElapsed } from '../hooks/useElapsed'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import TopAppBar from '../components/layout/TopAppBar'

function fmt(secs) {
  const h = String(Math.floor(secs / 3600)).padStart(2, '0')
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0')
  const s = String(secs % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

// dayKey "YYYY-MM-DD" theo giờ VN (Asia/Ho_Chi_Minh) — dùng để reset phiên qua ngày.
function vnDayKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(date)
}

export default function Esports() {
  const { machineNo } = useCart()
  const [startedAt, setStartedAt] = useState(null) // epoch ms, từ Firestore

  // Mở/khôi phục phiên chơi theo máy, lưu Firestore để sống qua F5 / đổi máy.
  useEffect(() => {
    if (!machineNo) { setStartedAt(null); return }
    let cancelled = false
    const ref = doc(db, 'playSessions', String(machineNo))
    const today = vnDayKey()
    ;(async () => {
      try {
        const snap = await getDoc(ref)
        if (!snap.exists() || snap.data().dayKey !== today) {
          // Chưa có phiên hoặc đã sang ngày mới → bắt đầu phiên mới.
          const now = Timestamp.now()
          await setDoc(ref, { machineNo: Number(machineNo), startedAt: now, dayKey: today })
          if (!cancelled) setStartedAt(now.toMillis())
        } else if (!cancelled) {
          // Phiên hôm nay đã tồn tại → giữ nguyên startedAt.
          setStartedAt(snap.data().startedAt.toMillis())
        }
      } catch (e) {
        console.error(e)
      }
    })()
    return () => { cancelled = true }
  }, [machineNo])

  const elapsed = useElapsed(startedAt)

  if (!machineNo) {
    return (
      <>
        <TopAppBar title="Esports" />
        <div className="pt-16 pb-20 px-4 flex items-center justify-center min-h-screen">
          <p className="text-secondary text-center">Vui lòng nhập số máy để bắt đầu phiên chơi.</p>
        </div>
      </>
    )
  }

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
