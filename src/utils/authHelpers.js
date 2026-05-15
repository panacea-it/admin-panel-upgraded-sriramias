/** Normalize backend role strings for the admin UI. */
export function normalizeRole(role) {
  if (!role) return 'superadmin'

  const normalized = String(role).toLowerCase().replace(/[\s_/\-]+/g, '')

  switch (normalized) {
    case 'superadmin':
    case 'super_admin':
      return 'superadmin'
    case 'centeradmin':
    case 'center_admin':
      return 'centeradmin'
    default:
      return normalized || role
  }
}

/**
 * Map API login response to { user, accessToken }.
 * Supports nested shapes: { data: { user, accessToken } }, { user, token }, etc.
 */
export function mapLoginResponse(apiResponse) {
  const root = apiResponse?.data ?? apiResponse
  const payload = root?.data ?? root

  const user = payload?.user ?? payload?.admin ?? payload?.superAdmin ?? root?.user
  const accessToken =
    payload?.accessToken ??
    payload?.token ??
    payload?.access_token ??
    root?.accessToken ??
    root?.token

  if (!user || !accessToken) {
    throw new Error(apiResponse?.message || root?.message || 'Invalid login response from server')
  }

  const name = user.name || user.fullName || user.email?.split('@')[0] || 'Admin'
  const email = user.email || ''
  const initials =
    user.avatar ||
    name
      .split(/\s+/)
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

  return {
    user: {
      ...user,
      name,
      email,
      avatar: initials,
      role: normalizeRole(user.role),
      centers: user.centers || (user.center ? [user.center] : ['All Centers']),
    },
    accessToken,
  }
}

export function normalizeStoredUser(user) {
  if (!user) return null
  return {
    ...user,
    role: normalizeRole(user.role),
  }
}

export function getLoginErrorMessage(error) {
  const data = error?.response?.data
  if (typeof data === 'string') return data
  if (data?.message) return data.message
  if (data?.error) return data.error
  if (Array.isArray(data?.errors) && data.errors[0]?.msg) return data.errors[0].msg
  if (error?.message) return error.message
  if (error?.code === 'ECONNABORTED') return 'Request timed out. Please try again.'
  if (error?.code === 'ERR_NETWORK') {
    return 'Network error — restart the dev server (npm run dev) and try again.'
  }
  if (!error?.response) return 'Unable to reach the server. Check your connection.'
  return 'Login failed. Please check your email and password.'
}
