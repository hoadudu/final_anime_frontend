/**
 * Token Storage Implementation
 * Based on DEVICE_BASED_REFRESH_TOKEN.md
 *
 * Strategy:
 * - Access Token: Stored in sessionStorage (cleared on tab close)
 * - Refresh Token: Stored in localStorage (persistent)
 * - User: Stored in sessionStorage (cleared on tab close)
 * - Device Info: Stored in localStorage (persistent)
 */

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  TOKEN_EXPIRES_AT: 'token_expires_at',
  USER: 'user',
  DEVICE_NAME: 'device_name',
}

/**
 * Token Storage Service
 * Handles all token and user data storage operations
 */
class TokenStorage {
  // ============ ACCESS TOKEN (sessionStorage) ============

  /**
   * Set access token with expiration time
   * @param {string} token - JWT access token
   * @param {number} expiresIn - Expiration time in seconds
   */
  setAccessToken(token, expiresIn = 900) {
    try {
      sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)

      // Calculate expiration timestamp
      const expiresAt = Date.now() + (expiresIn * 1000)
      sessionStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRES_AT, expiresAt.toString())

      if (process.env.NODE_ENV === 'development') {
        console.log('💾 Access token stored (expires in', expiresIn, 'seconds)')
      }
    } catch (error) {
      console.error('Failed to store access token:', error)
    }
  }

  /**
   * Get access token
   * @returns {string|null}
   */
  getAccessToken() {
    try {
      return sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    } catch (error) {
      console.error('Failed to get access token:', error)
      return null
    }
  }

  /**
   * Clear access token
   */
  clearAccessToken() {
    try {
      sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      sessionStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRES_AT)

      if (process.env.NODE_ENV === 'development') {
        console.log('🗑️ Access token cleared')
      }
    } catch (error) {
      console.error('Failed to clear access token:', error)
    }
  }

  // ============ REFRESH TOKEN (localStorage) ============

  /**
   * Set refresh token with expiration date
   * @param {string} token - Refresh token
   * @param {string} refreshExpiresAt - ISO date string
   */
  setRefreshToken(token, refreshExpiresAt = null) {
    try {
      if (!token) return

      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token)

      if (process.env.NODE_ENV === 'development') {
        console.log('💾 Refresh token stored', refreshExpiresAt ? `(expires: ${refreshExpiresAt})` : '')
      }
    } catch (error) {
      console.error('Failed to store refresh token:', error)
    }
  }

  /**
   * Get refresh token
   * @returns {string|null}
   */
  getRefreshToken() {
    try {
      return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
    } catch (error) {
      console.error('Failed to get refresh token:', error)
      return null
    }
  }

  /**
   * Clear refresh token
   */
  clearRefreshToken() {
    try {
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)

      if (process.env.NODE_ENV === 'development') {
        console.log('🗑️ Refresh token cleared')
      }
    } catch (error) {
      console.error('Failed to clear refresh token:', error)
    }
  }

  // ============ USER DATA (sessionStorage) ============

  /**
   * Set user data
   * @param {Object} user - User object
   */
  setUser(user) {
    try {
      if (!user) return

      sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))

      if (process.env.NODE_ENV === 'development') {
        console.log('💾 User data stored:', user.email || user.name)
      }
    } catch (error) {
      console.error('Failed to store user data:', error)
    }
  }

  /**
   * Get user data
   * @returns {Object|null}
   */
  getUser() {
    try {
      const userJson = sessionStorage.getItem(STORAGE_KEYS.USER)
      return userJson ? JSON.parse(userJson) : null
    } catch (error) {
      console.error('Failed to get user data:', error)
      return null
    }
  }

  /**
   * Clear user data
   */
  clearUser() {
    try {
      sessionStorage.removeItem(STORAGE_KEYS.USER)

      if (process.env.NODE_ENV === 'development') {
        console.log('🗑️ User data cleared')
      }
    } catch (error) {
      console.error('Failed to clear user data:', error)
    }
  }

  // ============ DEVICE INFO (localStorage) ============

  /**
   * Set device name
   * @param {string} deviceName
   */
  setDeviceName(deviceName) {
    try {
      if (!deviceName) return

      localStorage.setItem(STORAGE_KEYS.DEVICE_NAME, deviceName)

      if (process.env.NODE_ENV === 'development') {
        console.log('💾 Device name stored:', deviceName)
      }
    } catch (error) {
      console.error('Failed to store device name:', error)
    }
  }

  /**
   * Get device name
   * @returns {string|null}
   */
  getDeviceName() {
    try {
      return localStorage.getItem(STORAGE_KEYS.DEVICE_NAME)
    } catch (error) {
      console.error('Failed to get device name:', error)
      return null
    }
  }

  /**
   * Clear device name
   */
  clearDeviceName() {
    try {
      localStorage.removeItem(STORAGE_KEYS.DEVICE_NAME)

      if (process.env.NODE_ENV === 'development') {
        console.log('🗑️ Device name cleared')
      }
    } catch (error) {
      console.error('Failed to clear device name:', error)
    }
  }

  // ============ TOKEN VALIDATION ============

  /**
   * Get token expiration timestamp
   * @returns {number|null}
   */
  getTokenExpiresAt() {
    try {
      const expiresAt = sessionStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT)
      return expiresAt ? parseInt(expiresAt, 10) : null
    } catch (error) {
      console.error('Failed to get token expiration:', error)
      return null
    }
  }

  /**
   * Check if token is expired
   * @param {number} bufferMs - Buffer time in milliseconds before actual expiration
   * @returns {boolean}
   */
  isTokenExpired(bufferMs = 60000) { // 60 seconds buffer by default
    try {
      const expiresAt = this.getTokenExpiresAt()

      if (!expiresAt) return true

      const now = Date.now()
      const isExpired = now >= (expiresAt - bufferMs)

      if (process.env.NODE_ENV === 'development' && isExpired) {
        console.log('⏰ Token expired or expiring soon')
      }

      return isExpired
    } catch (error) {
      console.error('Failed to check token expiration:', error)
      return true
    }
  }

  /**
   * Check if we have a valid (non-expired) access token
   * @returns {boolean}
   */
  hasValidToken() {
    const token = this.getAccessToken()

    if (!token) return false

    return !this.isTokenExpired()
  }

  /**
   * Check if user is authenticated (has user data and either valid token or refresh token)
   * @returns {boolean}
   */
  isAuthenticated() {
    const user = this.getUser()
    const hasValidToken = this.hasValidToken()
    const hasRefreshToken = !!this.getRefreshToken()

    return !!user && (hasValidToken || hasRefreshToken)
  }

  // ============ CLEANUP ============

  /**
   * Clear all authentication data
   */
  clearAll() {
    this.clearAccessToken()
    this.clearRefreshToken()
    this.clearUser()
    this.clearDeviceName()

    if (process.env.NODE_ENV === 'development') {
      console.log('🗑️ All auth data cleared')
    }
  }

  /**
   * Get current auth state (for debugging)
   * @returns {Object}
   */
  getAuthState() {
    return {
      hasAccessToken: !!this.getAccessToken(),
      hasRefreshToken: !!this.getRefreshToken(),
      hasUser: !!this.getUser(),
      hasValidToken: this.hasValidToken(),
      isAuthenticated: this.isAuthenticated(),
      tokenExpiresAt: this.getTokenExpiresAt(),
      user: this.getUser(),
      deviceName: this.getDeviceName(),
    }
  }
}

// Export singleton instance
export const tokenStorage = new TokenStorage()

// Export class for testing
export { TokenStorage }
