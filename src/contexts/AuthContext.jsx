import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { login as loginApi, logout as logoutApi } from '../api/authAPI'
import { normalizeStoredUser } from '../utils/authHelpers'
import {
  clearAuthStorage,
  getAuthToken,
  getStoredUserJson,
  persistAuth,
} from '../utils/authStorage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [selectedCenter, setSelectedCenter] = useState('All Centers')
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)

  useEffect(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')

    const token = getAuthToken()
    const stored = getStoredUserJson()
    if (token && stored) {
      try {
        const parsed = normalizeStoredUser(JSON.parse(stored))
        if (parsed) setUser(parsed)
        else clearAuthStorage()
      } catch {
        clearAuthStorage()
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (credentials) => {
    setAuthLoading(true)
    try {
      const { user: u, accessToken } = await loginApi(credentials)
      persistAuth(accessToken, u)
      setUser(u)
      setSelectedCenter(u.center || u.centers?.[0] || 'All Centers')
      return u
    } finally {
      setAuthLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    logoutApi()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      authLoading,
      selectedCenter,
      setSelectedCenter,
      login,
      logout,
    }),
    [user, loading, authLoading, selectedCenter, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
