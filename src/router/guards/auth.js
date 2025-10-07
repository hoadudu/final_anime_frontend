import { useAuthStore } from 'src/stores/auth'

export function createAuthGuard() {
    return async function authGuard(to, from, next) {
        const requiresAuth = to.matched.some((r) => r.meta && r.meta.requiresAuth)
        if (!requiresAuth) return next()

        const auth = useAuthStore()
        if (auth.isAuthenticated) return next()

        auth.hydrateFromStorage()
        if (auth.isAuthenticated) return next()

        try {
            await auth.refreshToken()
            return next()
        } catch (e) {
            void e
            return next({ name: 'home', query: { login: '1', redirect: to.fullPath } })
        }
    }
}


