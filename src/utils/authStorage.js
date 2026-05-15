const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

/** Session-only auth so each new browser session must sign in. */
export function clearAuthStorage() {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getAuthToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function getStoredUserJson() {
  return sessionStorage.getItem(USER_KEY)
}

export function persistAuth(token, user) {
  sessionStorage.setItem(TOKEN_KEY, token)
  sessionStorage.setItem(USER_KEY, JSON.stringify(user))
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
