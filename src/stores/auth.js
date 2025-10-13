import { defineStore } from 'pinia'
import { tokenStorage } from 'src/utils/auth'
import { authService } from 'src/services/authService'

/**
 * Auth Store
 * Simplified and robust authentication management
 *
 * Features:
 * - User login/logout
 * - Token refresh
 * - User profile management
 * - Device management
 */

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isLoading: false,
    isRefreshing: false,
    refreshPromise: null,
  }),

  getters: {
    /**
     * Check if user is authenticated
     * Returns true if we have user data OR if we have refresh token (user data can be loaded)
     */
    isAuthenticated: (state) => {
      // If we have user in state and valid authentication, return true
      if (state.user && tokenStorage.isAuthenticated()) {
        return true
      }

      // If we have refresh token but no user in state yet (e.g., after tab reopen)
      // We can still be authenticated as the app will load user data
      if (!state.user && tokenStorage.hasValidRefreshToken()) {
        return true
      }

      return false
    },

    /**
     * Check if has valid access token
     */
    hasValidToken: () => {
      return tokenStorage.hasValidToken()
    },

    /**
     * Get current access token
     */
    accessToken: () => {
      return tokenStorage.getAccessToken()
    },

    /**
     * Get token expiration timestamp
     */
    tokenExpiresAt: () => {
      return tokenStorage.getTokenExpiresAt()
    },
  },

  actions: {
    /**
     * Initialize auth state from storage
     * Called on app boot
     */
    init() {
      try {
        // Load user from storage
        this.user = tokenStorage.getUser()

        if (process.env.NODE_ENV === 'development') {
          console.log('🚀 Auth initialized:', tokenStorage.getAuthState())
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
      }
    },

    _applyAuthPayload(payload) {
      if (!payload) {
        return
      }

      const {
        accessToken,
        refreshToken,
        expiresIn,
        refreshExpiresAt,
        user,
        deviceName,
      } = payload

      if (accessToken) {
        tokenStorage.setAccessToken(accessToken, expiresIn)
      }

      if (refreshToken || refreshExpiresAt) {
        const effectiveRefreshToken = refreshToken || tokenStorage.getRefreshToken()

        if (effectiveRefreshToken) {
          tokenStorage.setRefreshToken(effectiveRefreshToken, refreshExpiresAt)
        }
      }

      if (deviceName) {
        tokenStorage.setDeviceName(deviceName)
      }

      if (user) {
        this.user = user
        tokenStorage.setUser(user)
      }
    },

    /**
     * User login
     * @param {Object} credentials - { email, password }
     */
    async login(credentials) {
      this.isLoading = true

      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔐 Logging in:', credentials.email)
        }

        const payload = await authService.login({
          email: credentials.email,
          password: credentials.password,
          remember: credentials.remember,
        })

        if (!payload?.accessToken) {
          throw new Error('No access token in response')
        }

        this._applyAuthPayload(payload)

        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Login successful')
        }

        return { success: true, user: this.user }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Login failed:', error.message)
        }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * User registration
     * @param {Object} payload - { name, email, password, password_confirmation, recaptcha_token }
     */
    async register(payload) {
      this.isLoading = true

      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('📝 Registering:', payload.email)
        }

        const response = await authService.register({
          name: payload.name,
          email: payload.email,
          password: payload.password,
          password_confirmation: payload.password_confirmation,
          recaptcha_token: payload.recaptcha_token,
        })

        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Registration successful')
        }

        return response
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Registration failed:', error.message)
        }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Refresh access token
     * Handles concurrent refresh requests
     */
    async refreshToken() {
      // If already refreshing, wait for that promise
      if (this.isRefreshing && this.refreshPromise) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 Refresh already in progress, waiting...')
        }
        return this.refreshPromise
      }

      this.isRefreshing = true

      // Create refresh promise
      this.refreshPromise = this._performRefresh()

      try {
        const result = await this.refreshPromise
        return result
      } finally {
        this.isRefreshing = false
        this.refreshPromise = null
      }
    },

    /**
     * Internal method to perform token refresh
     */
    async _performRefresh() {
      try {
        const refreshToken = tokenStorage.getRefreshToken()

        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 Refreshing access token...')
        }

        if (tokenStorage.isRefreshExpired()) {
          throw new Error('Refresh token expired')
        }

        const payload = await authService.refresh(refreshToken)

        if (!payload?.accessToken) {
          throw new Error('No access token in refresh response')
        }

        this._applyAuthPayload({
          ...payload,
          refreshToken: payload.refreshToken || refreshToken,
        })

        if (!payload.user && this.user) {
          if (process.env.NODE_ENV === 'development') {
            console.log('⚠️ Token refreshed but no user data in response')
          }
        }

        return { success: true, accessToken: payload.accessToken }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Token refresh failed:', error.message)
        }

        // If refresh fails, logout user
        if (
          error.response?.status === 401 ||
          error.message.includes('No refresh token') ||
          error.message.includes('Refresh token expired')
        ) {
          this.logout(true) // Silent logout (no API call)
        }

        throw error
      }
    },

    /**
     * Load user profile
     */
    async loadProfile() {
      try {
        // Check if token needs refresh before making request
        if (!this.hasValidToken && tokenStorage.hasValidRefreshToken()) {
          await this.refreshToken()
        }

        const user = await authService.fetchProfile()

        if (user) {
          this.user = user
          tokenStorage.setUser(user)
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Profile loaded')
        }

        return user
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Failed to load profile:', error.message)
        }

        // If 401, logout
        if (error.response?.status === 401) {
          await this.logout()
        }

        throw error
      }
    },

    /**
     * Forgot password
     * @param {Object} payload - { email, recaptcha_token }
     */
    async forgotPassword(payload) {
      this.isLoading = true

      try {
        const response = await authService.forgotPassword({
          email: payload.email,
          recaptcha_token: payload.recaptcha_token,
        })

        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Password reset email sent')
        }

        return response
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Forgot password failed:', error.message)
        }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Reset password
     * @param {Object} payload - { token, email, password, password_confirmation, recaptcha_token }
     */
    async resetPassword(payload) {
      this.isLoading = true

      try {
        const response = await authService.resetPassword({
          token: payload.token,
          email: payload.email,
          password: payload.password,
          password_confirmation: payload.password_confirmation,
          recaptcha_token: payload.recaptcha_token,
        })

        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Password reset successful')
        }

        return response
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Password reset failed:', error.message)
        }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * User logout
     * @param {boolean} silent - If true, skip server-side logout call
     */
    async logout(silent = false) {
      try {
        if (!silent) {
          const refreshToken = tokenStorage.getRefreshToken()

          if (refreshToken) {
            if (process.env.NODE_ENV === 'development') {
              console.log('🚪 Logging out...')
            }
            let serverLoggedOut = false

            if (!tokenStorage.isRefreshExpired()) {
              await authService.logout(refreshToken)
              serverLoggedOut = true
            }

            if (process.env.NODE_ENV === 'development' && serverLoggedOut) {
              console.log('✅ Server logout successful')
            }
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Server logout failed (continuing):', error.message)
        }
        // Continue with cleanup even if server logout fails
      } finally {
        // Always clear local data
        this.clearAuth()
      }
    },

    /**
     * Clear all auth data (client-side only)
     */
    clearAuth() {
      // Clear storage
      tokenStorage.clearAll()

      // Clear state
      this.user = null
      this.isRefreshing = false
      this.refreshPromise = null

      if (process.env.NODE_ENV === 'development') {
        console.log('🗑️ Auth cleared')
      }
    },

    /**
     * Get user devices
     */
    async getDevices() {
      try {
        const response = await authService.fetchDevices()

        if (process.env.NODE_ENV === 'development') {
          console.log('📱 Devices loaded:', response?.total_count || 0)
        }

        return response
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Failed to load devices:', error.message)
        }
        throw error
      }
    },

    /**
     * Revoke specific device
     * @param {string} deviceFingerprint
     */
    async revokeDevice(deviceFingerprint) {
      try {
        const response = await authService.revokeDevice(deviceFingerprint)

        if (process.env.NODE_ENV === 'development') {
          console.log('🚫 Device revoked')
        }

        return response
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Failed to revoke device:', error.message)
        }
        throw error
      }
    },

    /**
     * Revoke all other devices
     */
    async revokeOtherDevices() {
      try {
        const response = await authService.revokeOtherDevices()

        if (process.env.NODE_ENV === 'development') {
          console.log('🚫 Other devices revoked:', response?.revoked_count || 0)
        }

        return response
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Failed to revoke other devices:', error.message)
        }
        throw error
      }
    },

    /**
     * Get token statistics
     */
    async getTokenStats() {
      try {
        const response = await authService.fetchTokenStats()

        if (process.env.NODE_ENV === 'development') {
          console.log('📊 Token stats loaded')
        }

        return response
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Failed to get token stats:', error.message)
        }
        throw error
      }
    },
  },
})
