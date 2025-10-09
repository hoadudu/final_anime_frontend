// import { computed } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { storeToRefs } from 'pinia'

export function useAuth() {
  const auth = useAuthStore()
  const { isAuthenticated, hasValidToken, user, isLoading } = storeToRefs(auth)

  async function login({ email, password, remember }) {
    return auth.login({ email, password, remember })
  }

  async function register(payload) {
    return auth.register(payload)
  }

  async function logout() {
    return auth.logout()
  }

  async function loadProfile() {
    return auth.loadProfile()
  }

  async function refreshToken() {
    return auth.refreshToken()
  }

  async function forgotPassword(payload) {
    return auth.forgotPassword(payload)
  }

  async function resetPassword(payload) {
    return auth.resetPassword(payload)
  }

  return {
    // state
    isAuthenticated,
    hasValidToken,
    user,
    isLoading,
    // actions
    login,
    register,
    logout,
    loadProfile,
    refreshToken,
    forgotPassword,
    resetPassword,
  }
}


