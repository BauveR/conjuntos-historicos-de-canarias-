import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import type { UserRole } from '../../contexts/AuthContext'

type Props = {
  children: ReactNode
  requiredRole?: UserRole
}

export function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, userRole, loading } = useAuth()
  const location = useLocation()

  if (loading) return null

  if (!user) {
    return <Navigate to="/login" state={{ returnTo: location.pathname, redirectAfterLogin: true }} replace />
  }

  if (requiredRole === 'admin' && userRole !== 'admin') {
    return <Navigate to="/perfil" replace />
  }

  return <>{children}</>
}
