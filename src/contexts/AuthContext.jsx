import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { login as loginApi, logout as logoutApi } from '../api/authAPI'
import { AUTH_LOGOUT_EVENT } from '../utils/authEvents'
import { normalizeStoredUser } from '../utils/authHelpers'
import {
  clearAuthStorage,
  getAuthToken,
  getStoredUserJson,
  persistAuth,
} from '../utils/authStorage'

const AuthContext = createContext(null)

function readStoredSession() {
  const token = getAuthToken()
  const stored = getStoredUserJson()
  if (!token || !stored) return null
  try {
    return normalizeStoredUser(JSON.parse(stored))
  } catch {
    clearAuthStorage()
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredSession)
  const [selectedCenter, setSelectedCenter] = useState(() => {
    const sessionUser = readStoredSession()
    return sessionUser?.center || sessionUser?.centers?.[0] || 'All Centers'
  })
  const [authLoading, setAuthLoading] = useState(false)

  useEffect(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }, [])

  useEffect(() => {
    const onForcedLogout = () => setUser(null)
    window.addEventListener(AUTH_LOGOUT_EVENT, onForcedLogout)
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, onForcedLogout)
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
      loading: false,
      authLoading,
      selectedCenter,
      setSelectedCenter,
      login,
      logout,
    }),
    [user, authLoading, selectedCenter, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook colocated with provider
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
