/**
 * Auth Middleware
 * Persists authentication state to localStorage
 */

import config from '@/config/environment'
import { storeAuthData, clearAuthData } from '@/utils/tokenUtils'

export const authMiddleware = (store) => (next) => (action) => {
  const result = next(action)
  const state = store.getState()

  // Persist auth state to localStorage
  if (action.type.startsWith('auth/')) {
    const auth = state.auth
    if (auth.isAuthenticated && auth.token) {
      storeAuthData({
        user: auth.user,
        token: auth.token,
        refreshToken: auth.refreshToken,
      })
    } else if (!auth.isAuthenticated) {
      clearAuthData()
      localStorage.removeItem('authState')
      localStorage.removeItem('authToken')
      localStorage.removeItem(config.auth.tokenKey)
      localStorage.removeItem(config.auth.refreshTokenKey)
      localStorage.removeItem('user')
    }
  }

  return result
}
