import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'
import { useAuthStore } from 'src/stores/auth'
import { tokenStorage } from 'src/utils/auth'
import { API_BASE_URL } from 'src/config/api'

/**
 * Axios Configuration
 *
 * Features:
 * - Automatic access token injection
 * - Auto-refresh on 401 errors
 * - Concurrent request handling during refresh
 * - Proper error handling
 */

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

// Track if we're currently refreshing
let isRefreshing = false
let failedQueue = []

/**
 * Process queued requests after token refresh
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

// ============ REQUEST INTERCEPTOR ============
api.interceptors.request.use(
  (config) => {
    // Debug logging for profile settings requests
    if (config.url?.includes('/profile/settings')) {
      console.log('🔍 Profile settings request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data
      })
    }

    // Prevent unnecessary OPTIONS requests
    if (config.method === 'options' && config.url?.includes('/profile/settings')) {
      console.warn('🚫 Blocking unnecessary OPTIONS request to:', config.url)
      return Promise.reject(new Error('Unnecessary OPTIONS request blocked'))
    }

    // Add access token to all requests
    const accessToken = tokenStorage.getAccessToken()

    if (accessToken) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ============ RESPONSE INTERCEPTOR ============
api.interceptors.response.use(
  (response) => {
    // Debug logging for profile settings responses
    if (response.config.url?.includes('/profile/settings')) {
      console.log('✅ Profile settings response:', {
        method: response.config.method?.toUpperCase(),
        url: response.config.url,
        status: response.status,
        data: response.data
      })
    }

    // Success response, pass through
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Check if this is a 401 error and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip refresh for auth endpoints
      const skipRefreshEndpoints = ['/auth/login', '/auth/register', '/auth/refresh-token', '/auth/logout']
      const shouldSkipRefresh = skipRefreshEndpoints.some((endpoint) => originalRequest.url?.includes(endpoint))

      if (shouldSkipRefresh) {
        return Promise.reject(error)
      }

      // Check if we have a refresh token
      const hasValidRefreshToken = tokenStorage.hasValidRefreshToken()

      if (!hasValidRefreshToken) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🚫 No refresh token, logging out')
        }

        // No refresh token, clear auth and reject
        const authStore = useAuthStore()
        authStore.clearAuth()

        return Promise.reject(error)
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        if (process.env.NODE_ENV === 'development') {
          console.log('⏳ Queuing request while refreshing:', originalRequest.url)
        }

        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token
            return api(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      // Mark as retrying
      originalRequest._retry = true
      isRefreshing = true

      // Attempt to refresh token
      const authStore = useAuthStore()

      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 401 detected, refreshing token...')
        }

        const result = await authStore.refreshToken()

        if (!result.accessToken) {
          throw new Error('No access token after refresh')
        }

        // Update queued requests with new token
        processQueue(null, result.accessToken)

        // Retry original request with new token
        originalRequest.headers['Authorization'] = 'Bearer ' + result.accessToken

        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Retrying request with new token:', originalRequest.url)
        }

        return api(originalRequest)
      } catch (refreshError) {

        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Token refresh failed, logging out')
          console.log(refreshError)
        }

        // Refresh failed, reject queued requests and clear auth
        processQueue(refreshError, null)
        authStore.clearAuth()

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Handle rate limiting
    if (error.response?.status === 429) {
      const retryAfter = error.response.data?.retry_after || 60

      if (process.env.NODE_ENV === 'development') {
        console.warn(`⚠️ Rate limited. Retry after ${retryAfter}s`)
      }

      error.message = `Too many requests. Please try again in ${retryAfter} seconds.`
    }

    // Log errors in development
    if (process.env.NODE_ENV === 'development' && error.response) {
      console.log('🚨 API Error:', {
        status: error.response.status,
        endpoint: `${error.config.method?.toUpperCase()} ${error.config.url}`,
        data: error.response.data,
      })
    }

    return Promise.reject(error)
  }
)

// ============ BOOT FUNCTION ============
export default defineBoot(async ({ app }) => {
  // Make axios available globally
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api

  // Initialize auth store
  const authStore = useAuthStore()
  authStore.init()

  // Check if we need to refresh token on app startup
  const hasRefreshToken = !!tokenStorage.getRefreshToken()
  const hasValidRefreshToken = tokenStorage.hasValidRefreshToken()
  const hasAccessToken = !!tokenStorage.getAccessToken()
  const hasUser = !!tokenStorage.getUser()

  if (!hasValidRefreshToken && hasRefreshToken) {
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ Refresh token expired, clearing from storage')
    }
    tokenStorage.clearRefreshToken()
  }

  if (hasValidRefreshToken && !hasAccessToken) {
    // Have refresh token but no access token
    // This happens after tab close/reopen (sessionStorage cleared but localStorage persists)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Refresh token found, getting new access token...')
    }

    try {
      await authStore.refreshToken()

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Access token refreshed on startup')

        // Check if user data was included in refresh response
        if (authStore.user) {
          console.log('✅ User data restored from refresh response')
        } else {
          console.log('⚠️ No user data in refresh response, loading profile...')
        }
      }

      // Fallback: If user data is still not available, load profile
      // This should rarely happen since API returns user in refresh response
      if (!authStore.user) {
        try {
          await authStore.loadProfile()
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ User profile loaded successfully')
          }
        } catch (profileError) {
          if (process.env.NODE_ENV === 'development') {
            console.error('❌ Failed to load profile:', profileError.message)
          }
          // If profile load fails, clear auth
          authStore.clearAuth()
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Failed to refresh token on startup:', error.message)
      }
      // If refresh fails, clear auth (logout)
      authStore.clearAuth()
    }
  } else if (hasValidRefreshToken && hasAccessToken && !hasUser) {
    // Have both tokens but no user data in sessionStorage
    // This can happen if sessionStorage was cleared but tokens remain
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Tokens found but no user data, loading profile...')
    }

    try {
      await authStore.loadProfile()
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ User profile loaded successfully')
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Failed to load profile on startup:', error.message)
      }
      // If profile load fails, try to refresh token
      try {
        await authStore.refreshToken()
        if (!authStore.user) {
          await authStore.loadProfile()
        }
      } catch (refreshError) {
        // If all fails, clear auth
        console.log(refreshError)
        authStore.clearAuth()
      }
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('🚀 Axios and Auth initialized', tokenStorage.getAuthState())
  }
})

export { api }
