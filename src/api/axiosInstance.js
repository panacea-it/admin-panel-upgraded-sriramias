import axios from 'axios'
import { emitAuthLogout } from '../utils/authEvents'
import { clearAuthStorage, getAuthToken } from '../utils/authStorage'

export function resolveApiBaseUrl() {
  // Dev: same-origin /api via Vite proxy (avoids browser CORS blocks)
  if (import.meta.env.DEV) {
    return '/api'
  }

  const raw = (
    import.meta.env.VITE_API_BASE_URL || 'https://new-sriramias.onrender.com'
  ).replace(/\/$/, '')

  return raw.endsWith('/api') ? raw : `${raw}/api`
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  // Bearer token auth only — credentials + ACAO:* breaks CORS in the browser
  withCredentials: false,
})

api.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login')
    if (error.response?.status === 401 && !isLoginRequest) {
      clearAuthStorage()
      emitAuthLogout()
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  },
)

export default api
