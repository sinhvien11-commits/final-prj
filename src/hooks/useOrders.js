import { useEffect, useState } from 'react'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useOrders(machineNo) {
  const [orders, setOrders] = useState([])
  const [error, setError]   = useState(null)

  useEffect(() => {
    if (!machineNo) return
    const q = query(
      collection(db, 'orders'),
      where('machineNo', '==', Number(machineNo)),
      where('status', 'in', ['received', 'preparing', 'delivering']),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(
      q,
      (snap) => setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => { setError('Không thể tải đơn hàng.'); console.error(err) }
    )
    return unsub
  }, [machineNo])

  return { orders, error }
}
