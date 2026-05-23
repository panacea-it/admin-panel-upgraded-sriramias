import { isDemoAuthEnabled, isFrontendOnly } from '../config/appMode'
import { findDemoUser } from '../data/demoAuthUsers'
import { clearAuthStorage } from '../utils/authStorage'
import { findEmployeeByCredentials } from '../utils/employeeAuthStorage'
import { getLoginErrorMessage, mapLoginResponse, normalizeRole } from '../utils/authHelpers'

function toSafeUser(record) {
  const { password: _password, ...safe } = record
  void _password
  const name = safe.name || safe.fullName || safe.email?.split('@')[0] || 'Admin'
  return {
    ...safe,
    name,
    role: normalizeRole(safe.role),
    avatar:
      safe.avatar ||
      name
        .split(/\s+/)
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    centers: safe.centers || (safe.center ? [safe.center] : ['All Centers']),
  }
}

function mockAuthenticate(email, password) {
  const employee = findEmployeeByCredentials(email, password)
  if (employee) {
    return {
      user: toSafeUser(employee),
      accessToken: `employee-token-${employee.id || employee.email}`,
    }
  }

  const demo = findDemoUser(email, password)
  if (demo) {
    return {
      user: toSafeUser(demo),
      accessToken: `demo-token-${demo.id}`,
    }
  }

  throw new Error('Invalid email or password')
}

/**
 * Admin login — frontend-only uses demo/employee accounts in localStorage.
 */
export async function login({ email, password, expectedRole }) {
  const credentials = {
    email: email.trim(),
    password: password.trim(),
  }

  if (!credentials.email || !credentials.password) {
    throw new Error('Email and password are required')
  }

  const tryMock = () => {
    const result = mockAuthenticate(credentials.email, credentials.password)
    if (expectedRole && result.user.role !== expectedRole) {
      throw new Error(
        'Selected role does not match this account. Choose the correct role or credentials.',
      )
    }
    return result
  }

  if (isFrontendOnly || isDemoAuthEnabled) {
    return tryMock()
  }

  try {
    const { default: api } = await import('./axiosInstance')
    const { data } = await api.post('/auth/login-super-admin', credentials, {
      timeout: 60000,
    })

    if (data?.success === false) {
      throw new Error(data.message || 'Login failed')
    }

    const mapped = mapLoginResponse(data)
    if (expectedRole && mapped.user.role !== expectedRole) {
      throw new Error(
        'Selected role does not match this account. Choose the correct role or credentials.',
      )
    }
    return mapped
  } catch (error) {
    if (error.response?.status === 404 || error.code === 'ERR_NETWORK' || !error.response) {
      return tryMock()
    }
    if (error.response?.status === 401) {
      try {
        return tryMock()
      } catch {
        /* fall through */
      }
    }
    throw new Error(getLoginErrorMessage(error), { cause: error })
  }
}

export function logout() {
  clearAuthStorage()
}
