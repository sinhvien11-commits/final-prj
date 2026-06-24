import { useEffect, useState } from 'react'

// Normalize a Firestore Timestamp | Date | epoch-ms number → epoch ms (or null).
function toMillis(value) {
  if (value == null) return null
  if (typeof value.toMillis === 'function') return value.toMillis()
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number') return value
  return null
}

// Live-updating elapsed seconds since `start`, ticking every second while
// `active`. Returns 0 until `start` is known. clearInterval on unmount/change.
export function useElapsed(start, active = true) {
  const startMs = toMillis(start)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!active || startMs == null) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [active, startMs])

  if (startMs == null) return 0
  return Math.max(0, Math.floor((now - startMs) / 1000))
}
