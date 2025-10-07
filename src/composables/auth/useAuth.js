// import { computed } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { storeToRefs } from 'pinia'

export function useAuth() {
  const auth = useAuthStore()
  const { isAuthenticated, user, isLoading } = storeToRefs(auth)

  async function login({ email, password, remember }) {
    return auth.login({ email, password, remember })
  }

  async function register({ email, password, name, password_confirmation }) {
    return auth.register({ email, password, name, password_confirmation })
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

  function hydrate() {
    auth.hydrateFromStorage()
  }

  return {
    // state
    isAuthenticated,
    user,
    isLoading,
    // actions
    login,
    register,
    logout,
    loadProfile,
    refreshToken,
    hydrate,
  }
}


