import { api } from 'boot/axios'

function normalizeAuthPayload(response) {
    const root = response?.data !== undefined ? response.data : response

    return {
        accessToken: root?.access_token || root?.accessToken || root?.token,
        refreshToken: root?.refresh_token || root?.refreshToken,
        expiresIn: root?.expires_in || root?.expiresIn || 900,
        refreshExpiresAt: root?.refresh_expires_at || root?.refreshExpiresAt,
        user: root?.user || root?.data?.user,
        deviceName: root?.device_name || root?.deviceName,
    }
}

async function login(credentials) {
    const response = await api.post('/auth/login', credentials)
    return normalizeAuthPayload(response)
}

async function register(payload) {
    const response = await api.post('/auth/register', payload)
    return response.data
}

async function refresh(refreshToken) {
    const response = await api.post('/auth/refresh-token', {
        refresh_token: refreshToken,
    })

    return normalizeAuthPayload(response)
}

async function logout(refreshToken) {
    if (!refreshToken) {
        return
    }

    await api.post('/auth/logout', {
        refresh_token: refreshToken,
    })
}

async function fetchProfile() {
    const response = await api.get('/auth/user-profile')
    return response.data?.data || response.data
}

async function forgotPassword(payload) {
    const response = await api.post('/auth/forgot-password', payload)
    return response.data
}

async function resetPassword(payload) {
    const response = await api.post('/auth/reset-password', payload)
    return response.data
}

async function fetchDevices() {
    const response = await api.get('/auth/devices')
    return response.data
}

async function revokeDevice(deviceFingerprint) {
    const response = await api.post('/auth/revoke-device', {
        device_fingerprint: deviceFingerprint,
    })
    return response.data
}

async function revokeOtherDevices() {
    const response = await api.post('/auth/revoke-other-devices')
    return response.data
}

async function fetchTokenStats() {
    const response = await api.get('/auth/token-stats')
    return response.data
}

export const authService = {
    login,
    register,
    refresh,
    logout,
    fetchProfile,
    forgotPassword,
    resetPassword,
    fetchDevices,
    revokeDevice,
    revokeOtherDevices,
    fetchTokenStats,
}

export { normalizeAuthPayload }
