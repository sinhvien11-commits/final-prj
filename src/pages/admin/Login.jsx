import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../../lib/firebase'
import { getAuthError } from '../../lib/authErrors'
import { roleHome } from '../../lib/roleHome'
import Button from '../../components/ui/Button'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const snap = await getDoc(doc(db, 'profiles', cred.user.uid))
      const role = snap.exists() ? snap.data().role : null
      navigate(roleHome(role))
    } catch (err) {
      setError(getAuthError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <div className="w-full max-w-sm bg-surface border border-surface-container-high rounded-2xl p-8 flex flex-col gap-6">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-primary-fixed">admin_panel_settings</span>
          <h1 className="font-display font-bold text-xl uppercase tracking-tight text-primary mt-2">
            OEG Admin
          </h1>
          <p className="text-secondary text-sm mt-1">Đăng nhập để quản lý</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-secondary text-xs uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="bg-surface-container border border-surface-container-high rounded-xl px-4 py-3 text-primary text-sm focus:outline-none focus:border-primary-fixed"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-secondary text-xs uppercase tracking-wider">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="bg-surface-container border border-surface-container-high rounded-xl px-4 py-3 text-primary text-sm focus:outline-none focus:border-primary-fixed"
            />
          </div>

          {error && <p className="text-error text-sm text-center">{error}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}
          </Button>
        </form>
      </div>
    </div>
  )
}
