import { useEffect, useState } from 'react'
import { doc, onSnapshot, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

// Live điểm thưởng của một máy. Lần đầu chưa có doc → tạo với balance=100
// (thưởng chào mừng), rồi subscribe realtime.
export function usePoints(machineNo) {
  const [balance, setBalance] = useState(null)

  useEffect(() => {
    if (!machineNo) { setBalance(null); return }
    const ref = doc(db, 'points', String(machineNo))

    getDoc(ref)
      .then((snap) => { if (!snap.exists()) setDoc(ref, { balance: 100, updatedAt: serverTimestamp() }) })
      .catch((e) => console.error(e))

    const unsub = onSnapshot(ref,
      (snap) => setBalance(snap.exists() ? snap.data().balance : null),
      (e) => console.error(e)
    )
    return unsub
  }, [machineNo])

  return balance
}
