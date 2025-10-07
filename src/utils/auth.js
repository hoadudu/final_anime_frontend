// Token storage helpers

const ACCESS_TOKEN_KEY = 'fa_access_token'
const ACCESS_TOKEN_EXPIRES_AT_KEY = 'fa_access_token_expires_at'
const ACCESS_TOKEN_STORAGE_KEY = 'fa_access_token_storage' // 'local' | 'session'

function getStorage() {
    try {
        const pref = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
        if (pref === 'session') return sessionStorage

        // If preference is 'local' or not set, prefer localStorage
        // but handle cases where localStorage might be disabled
        try {
            // Test if localStorage is actually writable
            const testKey = '__test__'
            localStorage.setItem(testKey, 'test')
            localStorage.removeItem(testKey)
            return localStorage
        } catch {
            // localStorage is not available, fallback to sessionStorage
            return sessionStorage
        }
    } catch {
        // If even reading preference fails, fallback to sessionStorage
        return sessionStorage
    }
}

export function getAccessToken() {
    try {
        const storage = getStorage()
        let token = null

        // Try preferred storage first
        try {
            token = storage.getItem(ACCESS_TOKEN_KEY)
        } catch {
            // If preferred storage fails, try the other one
            if (storage === localStorage) {
                token = sessionStorage.getItem(ACCESS_TOKEN_KEY)
            } else {
                token = localStorage.getItem(ACCESS_TOKEN_KEY)
            }
        }

        // Final fallback - check both storages
        if (!token) {
            token = localStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(ACCESS_TOKEN_KEY)
        }

        // Debug logging (only in development)
        if (process.env.NODE_ENV === 'development' && token) {
            console.log('🔑 getAccessToken from:', storage === localStorage ? 'localStorage' : 'sessionStorage', '(preferred)')
        }

        return token
    } catch {
        return null
    }
}

export function setAccessToken(token, expiresInSeconds, persist = true) {
    try {
        if (!token) {
            clearAccessToken()
            return
        }

        // Debug logging (only in development)
        if (process.env.NODE_ENV === 'development') {
            console.log('💾 setAccessToken called:', {
                persist,
                requestedStorage: persist ? 'localStorage' : 'sessionStorage',
                tokenLength: token.length
            })
        }

        let storage = persist ? localStorage : sessionStorage

        // If persist is true but localStorage is not available, fallback to sessionStorage
        if (persist) {
            try {
                const testKey = '__test__'
                localStorage.setItem(testKey, 'test')
                localStorage.removeItem(testKey)
            } catch {
                // localStorage not available, use sessionStorage instead
                storage = sessionStorage
                if (process.env.NODE_ENV === 'development') {
                    console.log('💾 localStorage not available, falling back to sessionStorage')
                }
            }
        }
        try {
            // write preference (may fail in private mode)
            try {
                // Update preference to reflect actual storage being used
                localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, storage === localStorage ? 'local' : 'session')
            } catch (e) {
                void e
                // ignore preference write failure
            }

            storage.setItem(ACCESS_TOKEN_KEY, token)
            if (typeof expiresInSeconds === 'number' && expiresInSeconds > 0) {
                const expiresAt = Date.now() + expiresInSeconds * 1000
                storage.setItem(ACCESS_TOKEN_EXPIRES_AT_KEY, String(expiresAt))
            }

            // keep only one storage to avoid ambiguity
            if (storage === localStorage) {
                sessionStorage.removeItem(ACCESS_TOKEN_KEY)
                sessionStorage.removeItem(ACCESS_TOKEN_EXPIRES_AT_KEY)
            } else {
                localStorage.removeItem(ACCESS_TOKEN_KEY)
                localStorage.removeItem(ACCESS_TOKEN_EXPIRES_AT_KEY)
            }

            if (process.env.NODE_ENV === 'development') {
                console.log('💾 Token stored in:', storage === localStorage ? 'localStorage' : 'sessionStorage')
            }
        } catch (e) {
            void e
            // Fallback to the other storage (private mode/quota errors)
            const fallbackStorage = storage === localStorage ? sessionStorage : localStorage
            try {
                // Update preference to reflect fallback storage
                try {
                    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, fallbackStorage === localStorage ? 'local' : 'session')
                } catch (e3) {
                    void e3
                    // ignore preference write failure
                }

                fallbackStorage.setItem(ACCESS_TOKEN_KEY, token)
                if (typeof expiresInSeconds === 'number' && expiresInSeconds > 0) {
                    const expiresAt = Date.now() + expiresInSeconds * 1000
                    fallbackStorage.setItem(ACCESS_TOKEN_EXPIRES_AT_KEY, String(expiresAt))
                }

                // Clear the original storage to avoid ambiguity
                storage.removeItem(ACCESS_TOKEN_KEY)
                storage.removeItem(ACCESS_TOKEN_EXPIRES_AT_KEY)

                if (process.env.NODE_ENV === 'development') {
                    console.log('💾 Fallback to', fallbackStorage === localStorage ? 'localStorage' : 'sessionStorage', 'due to storage failure')
                }
            } catch (e2) {
                void e2
                // ignore if fallback storage also fails
            }
        }
    } catch (e) {
        void e
        // ignore
    }
}

export function clearAccessToken() {
    try {
        // Clear from localStorage
        localStorage.removeItem(ACCESS_TOKEN_KEY)
        localStorage.removeItem(ACCESS_TOKEN_EXPIRES_AT_KEY)
        localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY) // Clear storage preference too

        // Clear from sessionStorage
        sessionStorage.removeItem(ACCESS_TOKEN_KEY)
        sessionStorage.removeItem(ACCESS_TOKEN_EXPIRES_AT_KEY)

        if (process.env.NODE_ENV === 'development') {
            console.log('🗑️ All tokens cleared from storage')
        }
    } catch (e) {
        if (process.env.NODE_ENV === 'development') {
            console.log('⚠️ Error clearing tokens:', e.message)
        }
        // ignore - might be in private mode
    }
}

export function getTokenExpiresAt() {
    try {
        const storage = getStorage()
        let expiresAt = null

        // Try preferred storage first
        try {
            expiresAt = storage.getItem(ACCESS_TOKEN_EXPIRES_AT_KEY)
        } catch {
            // If preferred storage fails, try the other one
            if (storage === localStorage) {
                expiresAt = sessionStorage.getItem(ACCESS_TOKEN_EXPIRES_AT_KEY)
            } else {
                expiresAt = localStorage.getItem(ACCESS_TOKEN_EXPIRES_AT_KEY)
            }
        }

        // Final fallback - check both storages
        if (!expiresAt) {
            expiresAt = localStorage.getItem(ACCESS_TOKEN_EXPIRES_AT_KEY) || sessionStorage.getItem(ACCESS_TOKEN_EXPIRES_AT_KEY)
        }

        return expiresAt ? parseInt(expiresAt, 10) : null
    } catch (e) {
        void e
        return null
    }
}

export function getAuthHeader() {
    const token = getAccessToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
}

export function isTokenExpired(bufferMs = 0) {
    const expiresAt = getTokenExpiresAt()
    if (!expiresAt) return false
    return Date.now() + bufferMs >= expiresAt
}

export const tokenStorage = {
    getAccessToken,
    setAccessToken,
    clearAccessToken,
    getTokenExpiresAt,
    getAuthHeader,
    isTokenExpired,
}


