import { useEffect, useState } from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useMenu(category) {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    setLoading(true)
    getDocs(query(collection(db, 'menuItems'), orderBy('createdAt')))
      .then((snap) => {
        let docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        if (category && category !== 'all') docs = docs.filter((d) => d.category === category)
        setItems(docs)
      })
      .catch(() => setError('Không thể tải menu.'))
      .finally(() => setLoading(false))
  }, [category])

  return { items, loading, error }
}
