import { ref, computed } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { tokenStorage } from 'src/utils/auth'

/**
 * Device Management Composable
 *
 * Provides reactive state and methods for managing user devices
 * Based on DEVICE_BASED_REFRESH_TOKEN.md
 */

export function useDeviceManagement() {
    const auth = useAuthStore()

    const devices = ref([])
    const tokenStats = ref(null)
    const isLoading = ref(false)
    const error = ref(null)

    // Current device name from storage
    const currentDeviceName = computed(() => tokenStorage.getDeviceName())

    // Computed: devices sorted by last used
    const sortedDevices = computed(() => {
        return [...devices.value].sort((a, b) => {
            return new Date(b.last_used_at) - new Date(a.last_used_at)
        })
    })

    // Computed: current device
    const currentDevice = computed(() => {
        return devices.value.find(d => d.is_current)
    })

    // Computed: other devices
    const otherDevices = computed(() => {
        return devices.value.filter(d => !d.is_current)
    })

    // Load devices list
    async function loadDevices() {
        isLoading.value = true
        error.value = null

        try {
            const data = await auth.getDevices()
            devices.value = data.devices || []
            return data
        } catch (e) {
            error.value = e.message
            throw e
        } finally {
            isLoading.value = false
        }
    }

    // Revoke specific device
    async function revokeDevice(deviceFingerprint) {
        isLoading.value = true
        error.value = null

        try {
            const data = await auth.revokeDevice(deviceFingerprint)

            // Reload devices list
            await loadDevices()

            return data
        } catch (e) {
            error.value = e.message
            throw e
        } finally {
            isLoading.value = false
        }
    }

    // Revoke all other devices
    async function revokeOtherDevices() {
        isLoading.value = true
        error.value = null

        try {
            const data = await auth.revokeOtherDevices()

            // Reload devices list
            await loadDevices()

            return data
        } catch (e) {
            error.value = e.message
            throw e
        } finally {
            isLoading.value = false
        }
    }

    // Load token statistics
    async function loadTokenStats() {
        isLoading.value = true
        error.value = null

        try {
            const data = await auth.getTokenStats()
            tokenStats.value = data
            return data
        } catch (e) {
            error.value = e.message
            throw e
        } finally {
            isLoading.value = false
        }
    }

    // Refresh all data
    async function refresh() {
        await Promise.all([
            loadDevices(),
            loadTokenStats()
        ])
    }

    return {
        // State
        devices,
        tokenStats,
        isLoading,
        error,

        // Computed
        currentDeviceName,
        sortedDevices,
        currentDevice,
        otherDevices,

        // Methods
        loadDevices,
        revokeDevice,
        revokeOtherDevices,
        loadTokenStats,
        refresh
    }
}

