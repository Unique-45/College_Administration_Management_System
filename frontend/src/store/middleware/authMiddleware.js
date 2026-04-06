/**
 * Auth Middleware
 * Persists authentication state to localStorage
 */

export const authMiddleware = (store) => (next) => (action) => {
  const result = next(action)
  const state = store.getState()

  // Persist auth state to localStorage
  if (action.type.startsWith('auth/')) {
    const auth = state.auth
    if (auth.isAuthenticated && auth.token) {
      localStorage.setItem(
        'authState',
        JSON.stringify({
          user: auth.user,
          token: auth.token,
          refreshToken: auth.refreshToken,
        })
      )
      localStorage.setItem('authToken', auth.token)
    } else if (!auth.isAuthenticated) {
      localStorage.removeItem('authState')
      localStorage.removeItem('authToken')
    }
  }

  return result
}
