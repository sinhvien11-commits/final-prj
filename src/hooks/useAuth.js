import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

export function useAuth() {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true) // stays true until profile is resolved

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true)
      setUser(firebaseUser)
      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, 'profiles', firebaseUser.uid))
          setProfile(snap.exists() ? snap.data() : null)
        } catch {
          setProfile(null)
        }
      } else {
        setProfile(null)
      }
      // Only finish loading AFTER the profile (and therefore role) is known,
      // so RequireAuth never sees a transient null role for a signed-in user.
      setLoading(false)
    })
    return unsub
  }, [])

  return { user, profile, role: profile?.role ?? null, loading }
}
