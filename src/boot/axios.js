import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'
import { useAuthStore } from 'src/stores/auth'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({ baseURL: 'http://localhost:8000/api' })

let isRefreshing = false
let refreshSubscribers = []

function onRefreshed(newToken) {
  refreshSubscribers.forEach((cb) => cb(newToken))
  refreshSubscribers = []
}

api.interceptors.request.use((config) => {
  try {
    const auth = useAuthStore()
    if (auth.accessToken) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${auth.accessToken}`
    }
  } catch (e) {
    void e
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config

    // Handle 401 errors for token refresh
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
      originalRequest._retry = true

      // Debug logging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Token expired, attempting refresh...', originalRequest.url)
      }

      const auth = useAuthStore()

      // Prevent multiple simultaneous refresh attempts
      if (!isRefreshing) {
        isRefreshing = true
        try {
          const { accessToken } = await auth.refreshToken()

          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Token refreshed successfully')
          }

          onRefreshed(accessToken)
        } catch (e) {
          if (process.env.NODE_ENV === 'development') {
            console.log('❌ Refresh token failed, logging out')
          }

          await auth.logout()
          return Promise.reject(e)
        } finally {
          isRefreshing = false
        }
      }

      // Queue this request to retry once refresh completes
      return new Promise((resolve) => {
        refreshSubscribers.push((newToken) => {
          originalRequest.headers = originalRequest.headers || {}
          originalRequest.headers.Authorization = `Bearer ${newToken}`

          if (process.env.NODE_ENV === 'development') {
            console.log('🔄 Retrying original request with new token')
          }

          resolve(api(originalRequest))
        })
      })
    }

    // Handle other errors (400, 422, etc.) - pass through for component handling
    // These will be caught by the component's try/catch blocks

    // Debug logging for non-401 errors (only in development)
    if (process.env.NODE_ENV === 'development' && error.response?.status !== 401) {
      console.log('🚨 API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response?.data
      })
    }

    return Promise.reject(error)
  }
)

export default defineBoot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API

  // Hydrate auth state early so initial requests include Authorization header
  try {
    const auth = useAuthStore()
    auth.hydrateFromStorage()
  } catch (e) {
    void e
  }
})

export { api }
