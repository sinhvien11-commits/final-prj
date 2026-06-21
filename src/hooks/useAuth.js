import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

export function useAuth() {
  const [user, setUser]       = useState(undefined) // undefined = still loading
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        const snap = await getDoc(doc(db, 'profiles', firebaseUser.uid))
        setProfile(snap.exists() ? snap.data() : null)
      } else {
        setProfile(null)
      }
    })
    return unsub
  }, [])

  return { user, profile, role: profile?.role ?? 'anon', loading: user === undefined }
}
