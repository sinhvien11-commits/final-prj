import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  collection, query, where, orderBy, onSnapshot,
  doc, getDoc, updateDoc, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import toast from 'react-hot-toast'
import { db } from '../../lib/firebase'

const TYPE_LABEL = {
  assist: { text: 'Gọi nhân viên', icon: 'support_agent', color: 'text-error' },
  extend: { text: 'Gia hạn giờ',   icon: 'more_time',     color: 'text-primary-fixed' },
}

function fmtTime(ts) {
  if (!ts?.toDate) return ''
  return ts.toDate().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

export default function AdminRequests() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [busyId, setBusyId]     = useState(null)

  useEffect(() => {
    const q = query(
      collection(db, 'serviceRequests'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q,
      (snap) => setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => { toast.error('Không thể tải yêu cầu.'); console.error(err) }
    )
    return unsub
  }, [])

  async function handle(req) {
    setBusyId(req.id)
    try {
      // Gia hạn: lùi startedAt của máy lại `minutes` phút → đồng hồ chạy thêm giờ.
      if (req.type === 'extend' && req.minutes > 0) {
        const ref  = doc(db, 'playSessions', String(req.machineNo))
        const snap = await getDoc(ref)
        if (snap.exists()) {
          const cur = snap.data().startedAt.toMillis()
          await updateDoc(ref, { startedAt: Timestamp.fromMillis(cur - req.minutes * 60000) })
        }
      }
      await updateDoc(doc(db, 'serviceRequests', req.id), {
        status:    'handled',
        updatedAt: serverTimestamp(),
      })
    } catch (e) {
      toast.error('Không thể cập nhật yêu cầu.')
      console.error(e)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-2xl uppercase tracking-tight text-primary">Yêu cầu phục vụ</h1>
          <p className="text-secondary text-sm mt-1">{requests.length} yêu cầu đang chờ</p>
        </div>
        <button onClick={() => navigate('/admin/orders')} className="text-secondary text-sm hover:text-primary">
          ← Kitchen Board
        </button>
      </div>

      <div className="flex flex-col gap-3 max-w-2xl">
        {requests.map((req) => {
          const t = TYPE_LABEL[req.type] ?? { text: req.type, icon: 'help', color: 'text-secondary' }
          return (
            <div key={req.id} className="bg-surface border border-surface-container-high rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined ${t.color}`}>{t.icon}</span>
                <div>
                  <p className="text-primary font-bold text-sm">
                    Máy {req.machineNo} — {t.text}
                    {req.type === 'extend' && req.minutes ? ` ${req.minutes} phút` : ''}
                  </p>
                  <p className="text-secondary text-xs mt-0.5">
                    {fmtTime(req.createdAt)}{req.note ? ` · ${req.note}` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handle(req)}
                disabled={busyId === req.id}
                className="bg-primary-fixed text-black text-xs font-bold uppercase px-4 py-2 rounded-lg hover:bg-primary-fixed-dim transition-colors disabled:opacity-50"
              >
                Đã xử lý
              </button>
            </div>
          )
        })}

        {requests.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="material-symbols-outlined text-5xl text-secondary">notifications_active</span>
            <p className="text-secondary text-sm">Không có yêu cầu nào đang chờ.</p>
          </div>
        )}
      </div>
    </div>
  )
}
