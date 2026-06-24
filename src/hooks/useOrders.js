import { useEffect, useState } from 'react'
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useOrders(machineNo) {
  const [orders, setOrders] = useState([])
  const [error, setError]   = useState(null)

  useEffect(() => {
    if (!machineNo) return
    // Only today's orders (from local midnight). All statuses are kept —
    // including "done"/"cancelled" — so completed orders stay visible.
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const q = query(
      collection(db, 'orders'),
      where('machineNo', '==', Number(machineNo)),
      where('createdAt', '>=', Timestamp.fromDate(startOfToday)),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(
      q,
      (snap) => {
        // A successful snapshot means the query is healthy — clear any stale
        // error from a previous failed fetch before showing the data.
        setError(null)
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      },
      (err) => { setError('errors.loadOrders'); console.error(err) }
    )
    return unsub
  }, [machineNo])

  return { orders, error }
}
