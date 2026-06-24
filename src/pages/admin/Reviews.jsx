import { useEffect, useState } from 'react'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import Spinner from '../../components/ui/Spinner'

// Admin giữ nguyên tiếng Việt, không dùng i18n (theo quy ước i18n/index.js).
const SOURCE_LABEL = {
  order:  { text: 'Đơn hàng',    icon: 'receipt_long', color: 'text-primary-fixed' },
  assist: { text: 'Gọi nhân viên', icon: 'support_agent', color: 'text-error' },
}

function fmtTime(ts) {
  if (!ts?.toDate) return ''
  return ts.toDate().toLocaleString('vi-VN', {
    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit',
  })
}

function Stars({ value }) {
  return (
    <span className="inline-flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`material-symbols-outlined text-[18px] ${n <= value ? 'text-primary-fixed' : 'text-surface-container-high'}`}
          style={n <= value ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          star
        </span>
      ))}
    </span>
  )
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // orderBy trên 1 trường (createdAt) dùng index mặc định — không cần composite index.
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'), limit(100))
    const unsub = onSnapshot(q,
      (snap) => { setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setLoading(false) },
      (err)  => { console.error(err); setLoading(false) }
    )
    return unsub
  }, [])

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length)
    : 0

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-6">
        <h1 className="font-display font-black text-2xl uppercase tracking-tight text-primary">Đánh giá</h1>
        <p className="text-secondary text-sm mt-1">{reviews.length} đánh giá</p>
      </div>

      {loading && <Spinner />}

      {!loading && (
        <>
          <div className="bg-surface border border-surface-container-high rounded-xl p-5 mb-6 flex items-center gap-4 max-w-md">
            <div>
              <p className="text-secondary text-xs uppercase tracking-wider mb-1">Điểm trung bình</p>
              <p className="font-display font-black text-3xl text-primary-fixed neon-text-glow">
                {avg ? avg.toFixed(1) : 'N/A'}
                <span className="text-secondary text-base font-normal"> / 5</span>
              </p>
            </div>
            <div className="ml-auto"><Stars value={Math.round(avg)} /></div>
          </div>

          <div className="flex flex-col gap-3 max-w-2xl">
            {reviews.map((r) => {
              const s = SOURCE_LABEL[r.source] ?? { text: r.source, icon: 'help', color: 'text-secondary' }
              return (
                <div key={r.id} className="bg-surface border border-surface-container-high rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Stars value={r.rating} />
                      <span className="text-primary font-bold text-sm">Máy {r.machineNo}</span>
                      <span className={`flex items-center gap-1 text-xs ${s.color}`}>
                        <span className="material-symbols-outlined text-[16px]">{s.icon}</span>
                        {s.text}
                      </span>
                    </div>
                    <span className="text-secondary text-xs shrink-0">{fmtTime(r.createdAt)}</span>
                  </div>
                  {r.comment && <p className="text-on-surface text-sm">{r.comment}</p>}
                </div>
              )
            })}

            {reviews.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <span className="material-symbols-outlined text-5xl text-secondary">reviews</span>
                <p className="text-secondary text-sm">Chưa có đánh giá nào.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
