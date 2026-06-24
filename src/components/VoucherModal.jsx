import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { collection, query, where, onSnapshot, doc, runTransaction, serverTimestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { db } from '../lib/firebase'

// Bỏ ký tự dễ nhầm (0/O, 1/I) cho mã voucher 6 ký tự.
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
function genCode() {
  let s = ''
  for (let i = 0; i < 6; i++) s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  return s
}

export default function VoucherModal({ machineNo, balance, onClose }) {
  const { t } = useTranslation()
  const [vouchers, setVouchers] = useState([])
  const [history, setHistory]   = useState([])
  const [busyId, setBusyId]     = useState(null)
  const [lastCode, setLastCode] = useState(null)

  // Catalog voucher active (sắp xếp theo điểm tăng dần, client-side để khỏi cần index).
  useEffect(() => {
    return onSnapshot(
      query(collection(db, 'vouchers'), where('active', '==', true)),
      (snap) => setVouchers(
        snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.cost - b.cost)
      ),
      (e) => console.error(e)
    )
  }, [])

  // Lịch sử voucher đã đổi của máy này (mới nhất lên đầu).
  useEffect(() => {
    if (!machineNo) return
    return onSnapshot(
      query(collection(db, 'redemptions'), where('machineNo', '==', Number(machineNo))),
      (snap) => setHistory(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
      ),
      (e) => console.error(e)
    )
  }, [machineNo])

  async function redeem(voucher) {
    setBusyId(voucher.id)
    const code = genCode()
    const pointsRef     = doc(db, 'points', String(machineNo))
    const redemptionRef = doc(collection(db, 'redemptions'))
    try {
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(pointsRef)
        const bal  = snap.exists() ? snap.data().balance : 100
        if (bal < voucher.cost) throw new Error('INSUFFICIENT')
        tx.set(pointsRef, { balance: bal - voucher.cost, updatedAt: serverTimestamp() }, { merge: true })
        tx.set(redemptionRef, {
          machineNo: Number(machineNo),
          voucherId: voucher.id,
          name:      voucher.name,
          code,
          createdAt: serverTimestamp(),
        })
      })
      setLastCode({ name: voucher.name, code })
      toast.success(t('voucher.success'))
    } catch (e) {
      if (e.message === 'INSUFFICIENT') toast.error(t('voucher.insufficient'))
      else { toast.error(t('voucher.failed')); console.error(e) }
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-[480px] max-h-[85vh] overflow-y-auto bg-surface border-t border-surface-container-high rounded-t-2xl p-5 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-primary uppercase tracking-tight">{t('voucher.title')}</h3>
          <button onClick={onClose} className="text-secondary hover:text-primary">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="bg-surface-container rounded-xl p-4 flex items-center justify-between">
          <span className="text-secondary text-sm">{t('voucher.currentPoints')}</span>
          <span className="font-display font-black text-2xl text-primary-fixed">{balance ?? '—'} pts</span>
        </div>

        {lastCode && (
          <div className="bg-primary-fixed/10 border border-primary-fixed rounded-xl p-4 text-center">
            <p className="text-secondary text-xs uppercase tracking-wider">{t('voucher.yourCode')}</p>
            <p className="font-display font-black text-3xl text-primary-fixed tracking-[0.3em] mt-1">{lastCode.code}</p>
            <p className="text-secondary text-xs mt-1">{lastCode.name}</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {vouchers.map((v) => {
            const affordable = balance == null || balance >= v.cost
            return (
              <div key={v.id} className="bg-surface-container rounded-xl p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-on-surface font-bold text-sm">{v.name}</p>
                  <p className="text-primary-fixed text-xs font-bold mt-0.5">{v.cost} pts</p>
                </div>
                <button
                  onClick={() => redeem(v)}
                  disabled={busyId === v.id || !affordable}
                  className="bg-primary-fixed text-black text-xs font-bold uppercase px-4 py-2 rounded-lg hover:bg-primary-fixed-dim transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                  {t('voucher.redeem')}
                </button>
              </div>
            )
          })}
          {vouchers.length === 0 && (
            <p className="text-secondary text-sm text-center py-4">{t('voucher.empty')}</p>
          )}
        </div>

        {history.length > 0 && (
          <div className="flex flex-col gap-2">
            <h4 className="text-secondary text-xs uppercase tracking-wider">{t('voucher.redeemed')}</h4>
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between text-sm border-b border-surface-container-high pb-2 last:border-0">
                <span className="text-on-surface">{h.name}</span>
                <span className="font-mono font-bold text-primary-fixed tracking-widest">{h.code}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
