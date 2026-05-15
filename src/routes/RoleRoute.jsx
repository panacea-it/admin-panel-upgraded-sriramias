import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * Client-side role gate for UI routes. API must enforce permissions server-side.
 */
export default function RoleRoute({ children, allowedRoles }) {
  const { user } = useAuth()
  const role = user?.role

  if (allowedRoles?.length && (!role || !allowedRoles.includes(role))) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
