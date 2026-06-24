import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { db } from '../lib/firebase'
import { useCart } from '../context/CartContext'
import Button from '../components/ui/Button'

const EMOJIS = ['😡', '😞', '😐', '😊', '🤩']

export default function Review() {
  const { t } = useTranslation()
  const [rating,  setRating]  = useState(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { machineNo } = useCart()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (rating === null) { toast.error(t('review.chooseRating')); return }
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'reviews'), {
        machineNo: Number(machineNo) || 0,
        rating:    rating + 1,
        comment:   comment.trim(),
        createdAt: serverTimestamp(),
      })
      toast.success(t('review.thanks'))
      navigate('/')
    } catch (err) {
      toast.error(t('review.error'))
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-[480px] bg-surface border border-surface-container-high rounded-t-2xl p-6 flex flex-col gap-5">
        <div className="text-center">
          <h2 className="font-display font-black text-xl uppercase tracking-tight text-primary">
            {t('review.title')}
          </h2>
          <p className="text-secondary text-sm mt-1">
            {t('review.subtitle')}
          </p>
          <p className="text-primary-fixed text-xs font-bold mt-2 neon-text-glow">
            {t('review.reward')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Emoji rating */}
          <div className="flex justify-center gap-3">
            {EMOJIS.map((emoji, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setRating(idx)}
                className={`text-3xl transition-all ${rating === idx ? 'scale-125' : 'grayscale opacity-60 hover:opacity-100 hover:grayscale-0'}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('review.placeholder')}
            rows={3}
            className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-3 text-sm text-on-surface resize-none focus:outline-none focus:border-primary-fixed"
          />

          <Button type="submit" disabled={submitting}>
            {submitting ? t('review.submitting') : t('review.submit')}
          </Button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-secondary text-xs uppercase tracking-wider hover:text-on-surface transition-colors"
          >
            {t('review.skip')}
          </button>
        </form>
      </div>
    </div>
  )
}
