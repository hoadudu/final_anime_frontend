import { ref, computed, watch } from 'vue'
import { useQuery, useMutation } from '@tanstack/vue-query'
import { API_BASE_URL } from 'src/config/api'
import { queryKeys } from 'src/utils/queryKeys'
import axios from 'axios'

// Global notification state
const notifications = ref([])
const unreadCount = ref(0)
const showNotificationModal = ref(false)
const currentNotification = ref(null)

export function useNotification() {
  // const queryClient = useQueryClient()

  // Fetch notifications
  const {
    data: notificationData,
    isLoading: isLoadingNotifications,
    error: notificationError,
    refetch: refetchNotifications
  } = useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: async () => {
      try {
        const response = await axios.get(API_BASE_URL + '/settings/notify')
        const data = response.data

        // Transform the API response to match our notification format
        if (data?.data?.main_notify) {
          const notify = data.data.main_notify
          // Only include active notifications
          if (notify.is_active) {
            return {
              notifications: [{
                main: notify.id,
                title: notify.name,
                message: notify.description,
                created_at: notify.created_at,
                read: false,
                type: notify.type,
                group: notify.group,
                is_active: notify.is_active
              }]
            }
          }
        }

        return { notifications: [] }
      } catch (error) {
        console.error('Error fetching notifications:', error)
        // Return mock data if API fails (for development)
        return {
          notifications: [
            {
              main: 1,
              title: 'Đăng nhập để xem thêm nội dung',
              message: 'Trang web đang trong quá trình hoàn thiện, nên các bạn thông cảm',
              created_at: '2025-10-14T06:24:43.000000Z',
              read: false
            }
          ]
        }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true
  })

  // Watch for notification data changes
  const updateNotificationState = () => {
    if (notificationData.value?.notifications) {
      notifications.value = notificationData.value.notifications
      unreadCount.value = notifications.value.filter(n => !n.read).length
    }
  }

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      // Since this is a settings-based notification, we'll just mark it as read locally
      // In a real implementation, you might want to store read status in localStorage or user preferences
      console.log('Marking notification as read:', notificationId)
      return { success: true }
    },
    onSuccess: (_, notificationId) => {
      // Update local state immediately
      const index = notifications.value.findIndex(n =>
        (n.main || n.id) === notificationId
      )
      if (index !== -1) {
        notifications.value[index].read = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    }
  })

  // Mark all notifications as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      // Since this is a settings-based notification, we'll just mark it as read locally
      return { success: true }
    },
    onSuccess: () => {
      // Update local state immediately
      notifications.value.forEach(n => n.read = true)
      unreadCount.value = 0
    }
  })

  // Computed properties
  const unreadNotifications = computed(() =>
    notifications.value.filter(n => !n.read)
  )

  const hasUnreadNotifications = computed(() =>
    unreadCount.value > 0
  )

  const latestNotification = computed(() => {
    if (notifications.value.length === 0) return null
    return notifications.value.sort((a, b) =>
      new Date(b.created_at) - new Date(a.created_at)
    )[0]
  })

  // Methods
  const showNotification = (notification) => {
    currentNotification.value = notification
    showNotificationModal.value = true
  }

  const hideNotification = () => {
    showNotificationModal.value = false
    currentNotification.value = null
  }

  const markAsRead = async (notification) => {
    if (notification.read) return

    try {
      await markAsReadMutation.mutateAsync(notification.main || notification.id)
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }

  const markAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync()
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      throw error
    }
  }

  const refreshNotifications = () => {
    refetchNotifications()
  }

  // Auto-show latest unread notification
  const checkAndShowLatestNotification = () => {
    if (hasUnreadNotifications.value && latestNotification.value) {
      showNotification(latestNotification.value)
    }
  }

  // Watch for data changes and update state
  watch(notificationData, () => {
    updateNotificationState()
  }, { immediate: true })

  return {
    // State
    notifications: computed(() => notifications.value),
    unreadCount: computed(() => unreadCount.value),
    showNotificationModal: computed({
      get: () => showNotificationModal.value,
      set: (value) => {
        showNotificationModal.value = value
        if (!value) {
          currentNotification.value = null
        }
      }
    }),
    currentNotification: computed(() => currentNotification.value),

    // Computed
    unreadNotifications,
    hasUnreadNotifications,
    latestNotification,

    // Loading states
    isLoadingNotifications,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,

    // Error states
    notificationError,

    // Methods
    showNotification,
    hideNotification,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    checkAndShowLatestNotification,
    updateNotificationState
  }
}

// Global notification functions for easy access
export const useGlobalNotification = () => {
  return {
    notifications: computed(() => notifications.value),
    unreadCount: computed(() => unreadCount.value),
    showNotificationModal: computed(() => showNotificationModal.value),
    currentNotification: computed(() => currentNotification.value),
    hasUnreadNotifications: computed(() => unreadCount.value > 0)
  }
}
