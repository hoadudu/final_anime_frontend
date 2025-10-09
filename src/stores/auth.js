import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { tokenStorage } from 'src/utils/auth'

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
     */
    isAuthenticated: (state) => {
      return !!state.user && tokenStorage.isAuthenticated()
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

    /**
     * Extract auth payload from API response
     * Handles different response formats
     */
    extractAuthPayload(response) {
      // Handle envelope format (data.data) or flat format (data)
      const root = response?.data !== undefined ? response.data : response

      return {
        accessToken: root?.access_token || root?.accessToken || root?.token,
        refreshToken: root?.refresh_token || root?.refreshToken,
        expiresIn: root?.expires_in || root?.expiresIn || 900,
        refreshExpiresAt: root?.refresh_expires_at || root?.refreshExpiresAt,
        user: root?.user || root?.data?.user,
        deviceName: root?.device_name || root?.deviceName,
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

        const response = await api.post('/auth/login', {
          email: credentials.email,
          password: credentials.password,
        })

        const { accessToken, refreshToken, expiresIn, refreshExpiresAt, user, deviceName } =
          this.extractAuthPayload(response)

        if (!accessToken) {
          throw new Error('No access token in response')
        }

        // Store tokens
        tokenStorage.setAccessToken(accessToken, expiresIn)
        tokenStorage.setRefreshToken(refreshToken, refreshExpiresAt)

        if (deviceName) {
          tokenStorage.setDeviceName(deviceName)
        }

        // Store user data
        if (user) {
          this.user = user
          tokenStorage.setUser(user)
        }

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

        const response = await api.post('/auth/register', {
          name: payload.name,
          email: payload.email,
          password: payload.password,
          password_confirmation: payload.password_confirmation,
          recaptcha_token: payload.recaptcha_token,
        })

        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Registration successful')
        }

        return response.data
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

        const response = await api.post('/auth/refresh-token', {
          refresh_token: refreshToken,
        })

        const { accessToken, refreshToken: newRefreshToken, expiresIn, refreshExpiresAt, user, deviceName } =
          this.extractAuthPayload(response)

        if (!accessToken) {
          throw new Error('No access token in refresh response')
        }

        // Update tokens
        tokenStorage.setAccessToken(accessToken, expiresIn)

        if (newRefreshToken) {
          tokenStorage.setRefreshToken(newRefreshToken, refreshExpiresAt)
        }

        if (deviceName) {
          tokenStorage.setDeviceName(deviceName)
        }

        // Update user if provided
        if (user) {
          this.user = user
          tokenStorage.setUser(user)
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Token refreshed successfully')
        }

        return { success: true, accessToken }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Token refresh failed:', error.message)
        }

        // If refresh fails, logout user
        if (error.response?.status === 401 || error.message.includes('No refresh token')) {
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
        if (!this.hasValidToken && tokenStorage.getRefreshToken()) {
          await this.refreshToken()
        }

        const response = await api.get('/auth/user-profile')
        const user = response.data?.data || response.data

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
        const response = await api.post('/auth/forgot-password', {
          email: payload.email,
          recaptcha_token: payload.recaptcha_token,
        })

        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Password reset email sent')
        }

        return response.data
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
        const response = await api.post('/auth/reset-password', {
          token: payload.token,
          email: payload.email,
          password: payload.password,
          password_confirmation: payload.password_confirmation,
          recaptcha_token: payload.recaptcha_token,
        })

        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Password reset successful')
        }

        return response.data
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

            await api.post('/auth/logout', {
              refresh_token: refreshToken,
            })

            if (process.env.NODE_ENV === 'development') {
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
        const response = await api.get('/auth/devices')

        if (process.env.NODE_ENV === 'development') {
          console.log('📱 Devices loaded:', response.data.total_count || 0)
        }

        return response.data
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
        const response = await api.post('/auth/revoke-device', {
          device_fingerprint: deviceFingerprint,
        })

        if (process.env.NODE_ENV === 'development') {
          console.log('🚫 Device revoked')
        }

        return response.data
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
        const response = await api.post('/auth/revoke-other-devices')

        if (process.env.NODE_ENV === 'development') {
          console.log('🚫 Other devices revoked:', response.data.revoked_count || 0)
        }

        return response.data
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
        const response = await api.get('/auth/token-stats')

        if (process.env.NODE_ENV === 'development') {
          console.log('📊 Token stats loaded')
        }

        return response.data
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Failed to get token stats:', error.message)
        }
        throw error
      }
    },
  },
})
