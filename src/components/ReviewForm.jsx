import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { db } from '../lib/firebase'

// Form đánh giá dùng chung cho màn khách (song ngữ). Hai nguồn:
//   - source='order'  : sau khi đơn hoàn thành (cần orderId)
//   - source='assist' : sau khi gọi nhân viên   (cần requestId)
// Doc-id tất định để rule chặn đánh giá trùng (!exists). localStorage để ẩn form
// ngay phía client mà không cần đọc lại Firestore (khách không có quyền read reviews).
function buildIds({ source, orderId, requestId, machineNo }) {
  if (source === 'order') {
    return { docId: `review_order_${orderId}`, lsKey: `reviewed_order_${orderId}` }
  }
  return {
    docId: `review_assist_${machineNo}_${requestId}`,
    lsKey: `reviewed_assist_${requestId}`,
  }
}

export default function ReviewForm({ source, orderId = null, requestId = null, machineNo }) {
  const { t } = useTranslation()
  const { docId, lsKey } = buildIds({ source, orderId, requestId, machineNo })

  const [rating, setRating]         = useState(0)
  const [comment, setComment]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  // Khởi tạo "đã đánh giá" từ localStorage → nếu đã đánh giá thì không hiện form.
  const [submitted, setSubmitted]   = useState(() => localStorage.getItem(lsKey) === '1')

  if (submitted) {
    return (
      <div className="bg-surface border border-surface-container-high rounded-xl p-4 flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-primary-fixed text-[20px]">check_circle</span>
        <p className="text-primary-fixed text-sm font-bold">{t('reviewForm.thanks')}</p>
      </div>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (rating < 1) { toast.error(t('reviewForm.chooseRating')); return }
    setSubmitting(true)
    try {
      // setDoc với id tất định: doc mới → create (rule cho phép); doc đã tồn tại →
      // update (rule chặn) ⇒ chống đánh giá trùng ở cả 2 tầng.
      await setDoc(doc(db, 'reviews', docId), {
        machineNo: Number(machineNo) || 0,
        rating,
        comment:   comment.trim(),
        source,
        orderId:   source === 'order' ? orderId : null,
        createdAt: serverTimestamp(),
      })
      localStorage.setItem(lsKey, '1')
      setSubmitted(true)
      toast.success(t('reviewForm.success'))
    } catch (err) {
      toast.error(t('reviewForm.error'))
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface border border-surface-container-high rounded-xl p-4 flex flex-col gap-3"
    >
      <p className="text-primary font-bold text-sm text-center">
        {source === 'assist' ? t('reviewForm.promptAssist') : t('reviewForm.promptOrder')}
      </p>

      <div className="flex justify-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={t('reviewForm.starLabel', { n })}
            className="transition-transform hover:scale-110"
          >
            <span
              className={`material-symbols-outlined text-[34px] ${n <= rating ? 'text-primary-fixed' : 'text-secondary'}`}
              style={n <= rating ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              star
            </span>
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t('reviewForm.placeholder')}
        rows={2}
        className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-3 text-sm text-on-surface resize-none focus:outline-none focus:border-primary-fixed"
      />

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-primary-fixed text-black font-bold text-xs uppercase tracking-wider py-3 rounded-xl neon-glow hover:bg-primary-fixed-dim transition-colors disabled:opacity-50"
      >
        {submitting ? t('reviewForm.submitting') : t('reviewForm.submit')}
      </button>
    </form>
  )
}
