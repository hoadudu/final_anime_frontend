/**
 * Notification Service
 * Based on FRONTEND_WORKFLOW.md
 *
 * Provides consistent notification messages for auth events
 * Uses Quasar Notify for displaying messages
 */

// This will be set during boot
let $q = null

export function setQuasarInstance(quasarInstance) {
    $q = quasarInstance
}

export const NotificationService = {
    // Generic notification
    show(message, type = 'info', options = {}) {
        if (!$q) {
            console.warn('Quasar instance not set for NotificationService')
            console.log(`[${type.toUpperCase()}] ${message}`)
            return
        }

        $q.notify({
            type,
            message,
            position: 'top',
            timeout: 3000,
            ...options
        })
    },

    // Success notifications
    success(message, options = {}) {
        this.show(message, 'positive', options)
    },

    // Error notifications
    error(message, options = {}) {
        this.show(message, 'negative', options)
    },

    // Warning notifications
    warning(message, options = {}) {
        this.show(message, 'warning', options)
    },

    // Info notifications
    info(message, options = {}) {
        this.show(message, 'info', options)
    },

    // Auth-specific notifications
    showLoginSuccess() {
        this.success('Đăng nhập thành công!')
    },

    showLogoutSuccess() {
        this.info('Đã đăng xuất')
    },

    showTokenRefreshed() {
        if (process.env.NODE_ENV === 'development') {
            this.info('Phiên làm việc đã được làm mới', { timeout: 2000 })
        }
    },

    showSessionExpired() {
        this.warning('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.', {
            timeout: 5000
        })
    },

    showRateLimited(retryAfter = 60) {
        this.warning(
            `Quá nhiều yêu cầu. Vui lòng thử lại sau ${retryAfter} giây.`,
            { timeout: 5000 }
        )
    },

    showRegistrationSuccess() {
        this.success('Đăng ký thành công! Vui lòng đăng nhập.')
    },

    showPasswordResetSent() {
        this.success('Email đặt lại mật khẩu đã được gửi!')
    },

    showPasswordResetSuccess() {
        this.success('Mật khẩu đã được đặt lại thành công!')
    },

    showInvalidCredentials() {
        this.error('Email hoặc mật khẩu không đúng')
    },

    showNetworkError() {
        this.error('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối của bạn.')
    },

    showServerError() {
        this.error('Lỗi máy chủ. Vui lòng thử lại sau.')
    },

    // Handle API errors
    showApiError(error) {
        if (!error.response) {
            this.showNetworkError()
            return
        }

        const { status, data } = error.response

        switch (status) {
            case 401:
                this.showInvalidCredentials()
                break
            case 429: {
                const retryAfter = data?.retry_after || 60
                this.showRateLimited(retryAfter)
                break
            }
            case 500:
            case 502:
            case 503:
            case 504:
                this.showServerError()
                break
            default: {
                // Try to extract error message from response
                const message =
                    data?.message ||
                    data?.error?.message ||
                    'Đã xảy ra lỗi. Vui lòng thử lại.'
                this.error(message)
            }
        }
    }
}

// Default export
export default NotificationService

