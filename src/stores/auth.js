import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { tokenStorage } from 'src/utils/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: tokenStorage.getAccessToken(),
    tokenExpiresAt: tokenStorage.getTokenExpiresAt(),
    user: null,
    isLoading: false,
  }),
  getters: {
    isAuthenticated(state) {
      return Boolean(state.accessToken)
    },
  },
  actions: {
    extractAuthPayload(raw) {
      // Accept multiple response shapes: envelope or flat
      const root = raw && raw.data !== undefined ? raw.data : raw
      const accessToken =
        root?.accessToken || root?.token || root?.access_token || null
      const expiresIn = root?.expiresIn || root?.expires_in || null
      const user = root?.user || root?.data?.user || null
      return { accessToken, expiresIn, user }
    },

    hydrateFromStorage() {
      this.accessToken = tokenStorage.getAccessToken()
      this.tokenExpiresAt = tokenStorage.getTokenExpiresAt()
    },

    setToken(token, expiresIn, persist = true) {
      tokenStorage.setAccessToken(token, expiresIn, persist)
      this.accessToken = token
      this.tokenExpiresAt = tokenStorage.getTokenExpiresAt()
    },

    clearToken() {
      tokenStorage.clearAccessToken()
      this.accessToken = null
      this.tokenExpiresAt = null

      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 Auth state cleared')
      }
    },

    async register(payload) {
      const { email, password, name, password_confirmation } = payload
      this.isLoading = true
      try {
        const { data } = await api.post('/auth/register', {
          email,
          password,
          name,
          password_confirmation
        })
        return data
      } finally {
        this.isLoading = false
      }
    },

    async login(payload) {
      const { email, password, remember = true } = payload

      // Debug logging để kiểm tra remember parameter (chỉ trong development)
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 Login payload:', { email, password, remember, originalRemember: payload.remember })
      }

      this.isLoading = true
      try {
        const { data } = await api.post('/auth/login', { email, password })

        // Debug logging để kiểm tra response shape (chỉ trong development)
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 Login response shape:', data)
          console.log('🔍 Extracted payload:', this.extractAuthPayload(data))
          console.log('🔍 Remember value:', remember, 'Boolean(remember):', Boolean(remember))
        }

        const { accessToken, expiresIn, user } = this.extractAuthPayload(data)
        if (accessToken) {
          // Debug logging để kiểm tra remember value trước khi gọi setToken
          if (process.env.NODE_ENV === 'development') {
            console.log('💾 About to call setToken with:', { accessToken: '***', expiresIn, remember, persist: Boolean(remember) })
          }
          this.setToken(accessToken, expiresIn, Boolean(remember))
        }
        if (user) this.user = user
        return data
      } finally {
        this.isLoading = false
      }
    },

    async loadProfile() {
      if (!this.accessToken) return null
      const { data } = await api.get('/auth/user-profile')
      const root = data && data.data !== undefined ? data.data : data
      if (root) this.user = root
      return data
    },

    async refreshToken() {
      const { data } = await api.post('/auth/refresh')
      const { accessToken, expiresIn } = this.extractAuthPayload(data)
      if (accessToken) {
        this.setToken(accessToken, expiresIn)
        return { accessToken }
      }
      throw new Error('Refresh failed')
    },

    async logout() {
      // Debug logging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 Logging out user...')
      }

      try {
        // Attempt to invalidate refresh token on server (best effort)
        await api.post('/auth/logout')

        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Server-side logout successful')
        }
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.log('⚠️ Server-side logout failed, continuing with client cleanup:', e.message)
        }
        // Continue with client cleanup even if server logout fails
      }

      // Clear all client-side data
      this.user = null
      this.clearToken()

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Client-side logout complete')
      }
    },
  },
})


