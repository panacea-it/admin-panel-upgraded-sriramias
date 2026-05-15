import api from './axiosInstance'
import { clearAuthStorage } from '../utils/authStorage'
import { getLoginErrorMessage, mapLoginResponse } from '../utils/authHelpers'

const DEMO_ENABLED = import.meta.env.VITE_ENABLE_DEMO_LOGIN === 'true'

const DEMO_USERS = [
  {
    id: 1,
    name: 'Sriram Kumar',
    email: 'superadmin@sriram.com',
    password: 'super123',
    role: 'superadmin',
    avatar: 'SK',
    centers: ['All Centers', 'Delhi Center', 'Mumbai Center'],
  },
]

function demoLogin(email, password) {
  const user = DEMO_USERS.find(
    (u) =>
      u.email.toLowerCase() === email.trim().toLowerCase() &&
      u.password === password.trim(),
  )
  if (!user) throw new Error('Invalid email or password')
  const { password: _, ...safe } = user
  return {
    user: safe,
    accessToken: `demo-token-${user.id}`,
  }
}

/**
 * Super Admin login — POST {BASE_URL}/api/auth/login-super-admin
 * Body: { email, password }
 */
export async function login({ email, password }) {
  const credentials = {
    email: email.trim(),
    password: password.trim(),
  }

  if (!credentials.email || !credentials.password) {
    throw new Error('Email and password are required')
  }

  try {
    const { data } = await api.post('/auth/login-super-admin', credentials, {
      timeout: 60000,
    })

    if (data?.success === false) {
      throw new Error(data.message || 'Login failed')
    }

    return mapLoginResponse(data)
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(
        `Login API not found. Confirm VITE_API_BASE_URL is https://new-sriramias.onrender.com (no trailing /api).`,
      )
    }

    if (DEMO_ENABLED && (error.code === 'ERR_NETWORK' || !error.response)) {
      try {
        return demoLogin(credentials.email, credentials.password)
      } catch {
        // fall through to API error message
      }
    }

    if (error.message && !error.response) {
      throw error
    }

    throw new Error(getLoginErrorMessage(error))
  }
}

export function logout() {
  clearAuthStorage()
}
