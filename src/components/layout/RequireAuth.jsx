import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Spinner from '../ui/Spinner'

export default function RequireAuth({ children, allowedRoles }) {
  const { user, role, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user)   return <Navigate to="/admin/login" replace />
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/admin" replace />
  return children
}
