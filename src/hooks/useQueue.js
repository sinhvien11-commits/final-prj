import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useQueue() {
  const [queue, setQueue] = useState({ activeOrders: 0, avgWaitMin: 0 })
  const [error, setError] = useState(null)

  useEffect(() => {
    const q = query(
      collection(db, 'orders'),
      where('status', 'in', ['received', 'preparing', 'delivering'])
    )
    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs  = snap.docs.map((d) => d.data())
        const waits = docs.map((d) => d.waitMin).filter(Boolean)
        setQueue({
          activeOrders: docs.length,
          avgWaitMin:   waits.length
            ? Math.round(waits.reduce((a, b) => a + b, 0) / waits.length)
            : 0,
        })
      },
      (err) => { setError('Không thể tải trạng thái hàng chờ.'); console.error(err) }
    )
    return unsub
  }, [])

  return { ...queue, error }
}
