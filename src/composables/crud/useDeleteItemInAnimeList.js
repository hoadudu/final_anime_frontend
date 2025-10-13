import { ref, watch } from 'vue'
import { debounce } from 'lodash-es'
import { useQuasar } from 'quasar'
import { useNetwork } from '@vueuse/core'
import { useI18n } from 'vue-i18n'

/**
 * Composable để xóa anime khỏi danh sách của user
 * @param {Object} api - Axios instance
 * @param {Object} userRef - Ref chứa user object
 * @returns {Object} - { deleteAnime, isDeleting, pendingQueue }
 */
export function useDeleteItemInAnimeList(api, userRef) {
  const $q = useQuasar()
  const { t } = useI18n()
  const isDeleting = ref(false)
  const pendingQueue = ref([])
  const { isOnline } = useNetwork()

  // Hàm gửi API xóa anime
  const sendDelete = async ({ animeId, status, silent = false }) => {
    // Check if user is logged in
    if (!userRef.value?.id || !userRef.value?.access_token) {
      if (!silent) {
        $q.notify({
          type: 'warning',
          message: t('animeInfo.pleaseLoginFirst', 'Please login first'),
          position: 'top',
        })
      }
      return { success: false, error: 'not_authenticated' }
    }

    if (!animeId) {
      if (!silent) {
        $q.notify({
          type: 'warning',
          message: t('animeInfo.invalidAnimeId', 'Invalid anime ID'),
          position: 'top',
        })
      }
      return { success: false, error: 'invalid_anime_id' }
    }

    if (isDeleting.value) {
      return { success: false, error: 'already_deleting' }
    }

    isDeleting.value = true
    const payload = {
      post_id: animeId,
      status: status || 'watching',
      access_token: userRef.value.access_token,
    }

    try {
      await api.delete('/profile/delete-anime', { data: payload })

      if (!silent) {
        $q.notify({
          type: 'positive',
          message: t('animeInfo.removedFromListSuccess', 'Removed from your list'),
          position: 'top',
          timeout: 1500,
        })
      }

      return { success: true }
    } catch (err) {
      console.error('Delete error:', err)

      // Nếu offline → thêm vào hàng đợi
      if (!isOnline.value) {
        pendingQueue.value.push({ animeId, status, silent })
        if (!silent) {
          $q.notify({
            type: 'warning',
            message: t('animeInfo.savedOffline', 'Saved offline, will sync when online'),
            position: 'top',
          })
        }
        return { success: false, error: 'offline', queued: true }
      } else {
        if (!silent) {
          $q.notify({
            type: 'negative',
            message: err.response?.data?.message || t('animeInfo.removedFromListError', 'Failed to remove from list'),
            position: 'top',
          })
        }
        return { success: false, error: err.response?.data?.message || 'unknown_error' }
      }
    } finally {
      isDeleting.value = false
    }
  }

  // Đồng bộ lại khi online trở lại
  watch(isOnline, async (online) => {
    if (online && pendingQueue.value.length > 0) {
      for (const item of pendingQueue.value) {
        await sendDelete(item)
      }
      pendingQueue.value = []
    }
  })

  // Debounce để tránh spam API khi người dùng click liên tục
  const deleteAnime = debounce(
    async ({ animeId, status, silent = false }) => {
      return await sendDelete({ animeId, status, silent })
    },
    500
  )

  return {
    deleteAnime, // Debounced version
    sendDelete, // Non-debounced version for immediate deletion
    isDeleting,
    pendingQueue,
  }
}
