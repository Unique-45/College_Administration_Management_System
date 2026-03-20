/**
 * Role Protected Route Component
 * Wraps routes that require authentication and specific role
 * Redirects to login if not authenticated, to unauthorized if wrong role
 */

import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const RoleProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default RoleProtectedRoute
