import { useAuthStore } from 'src/stores/auth'
import { tokenStorage } from 'src/utils/auth'

/**
 * Auth Guard
 * Protects routes that require authentication
 *
 * Usage in routes:
 * meta: { requiresAuth: true }
 */

export function createAuthGuard() {
    return async function authGuard(to, from, next) {
        // Check if route requires authentication
        const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth)

        // If route doesn't require auth, allow access
        if (!requiresAuth) {
            return next()
        }

        if (process.env.NODE_ENV === 'development') {
            console.log('🛡️ Auth guard checking:', to.path)
        }

        const authStore = useAuthStore()

        // Case 1: User is authenticated with valid token
        if (authStore.isAuthenticated && authStore.hasValidToken) {
            if (process.env.NODE_ENV === 'development') {
                console.log('✅ Auth guard: Valid token, access granted')
            }
            return next()
        }

        // Case 2: User has refresh token but no valid access token
        // Try to refresh the token
        const refreshToken = tokenStorage.getRefreshToken()

        if (refreshToken) {
            try {
                if (process.env.NODE_ENV === 'development') {
                    console.log('🔄 Auth guard: Refreshing token...')
                }

                await authStore.refreshToken()

                // Check if refresh was successful
                if (authStore.isAuthenticated && authStore.hasValidToken) {
                    if (process.env.NODE_ENV === 'development') {
                        console.log('✅ Auth guard: Token refreshed, access granted')
                    }
                    return next()
                }
            } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    console.error('❌ Auth guard: Token refresh failed:', error.message)
                }
                // Continue to redirect to home with login prompt
            }
        }

        // Case 3: No valid authentication
        // Redirect to home page with login prompt
        if (process.env.NODE_ENV === 'development') {
            console.log('🚫 Auth guard: Not authenticated, redirecting')
        }

        return next({
            name: 'home',
            query: {
                login: '1',
                redirect: to.fullPath,
            },
        })
    }
}
