import { ref, watch } from 'vue'
import { debounce } from 'lodash-es'
import { useQuasar } from 'quasar'
import { useNetwork } from '@vueuse/core'
import { useI18n } from 'vue-i18n'

export function useAutoWatchStatus(api, animeIdRef, userRef) {
  const $q = useQuasar()
  const { t } = useI18n()
  const isSyncing = ref(false)
  const pendingQueue = ref([])
  const { isOnline } = useNetwork()

  // Đồng bộ lại khi online trở lại
  watch(isOnline, async (online) => {
    if (online && pendingQueue.value.length > 0) {
      for (const item of pendingQueue.value) {
        await sendUpdate(item)
      }
      pendingQueue.value = []
    }
  })

  // Hàm gửi API chính
  const sendUpdate = async ({ status, silent = true }) => {
    // Check if we have animeId and user is logged in
    if (!animeIdRef.value) return
    if (!userRef.value?.id) {
      if (!silent) {
        $q.notify({
          type: 'warning',
          message: t('animeInfo.pleaseLoginFirst'),
          position: 'top',
        })
      }
      return
    }

    if (isSyncing.value) return

    isSyncing.value = true
    const payload = {
      post_id: animeIdRef.value,
      status,
      type: 'default',
    }

    try {
      await api.post('/profile/add-anime', payload)
      if (!silent) {
        $q.notify({
          type: 'positive',
          message: t('animeInfo.addedToListSuccess'),
          position: 'top',
          timeout: 1500,
        })
      }
    } catch (err) {
      console.error('Sync error:', err)

      // Nếu offline → thêm vào hàng đợi
      if (!isOnline.value) {
        pendingQueue.value.push({ status, silent })
        if (!silent) {
          $q.notify({
            type: 'warning',
            message: t('animeInfo.savedOffline'),
            position: 'top',
          })
        }
      } else if (!silent) {
        $q.notify({
          type: 'negative',
          message: err.response?.data?.message || t('animeInfo.addedToListError'),
          position: 'top',
        })
      }
    } finally {
      isSyncing.value = false
    }
  }

  // Debounce để tránh spam API khi người dùng click liên tục
  const syncStatus = debounce(
    (status = 'watching', options = { silent: true }) =>
      sendUpdate({ status, ...options }),
    800
  )

  return {
    syncStatus,
    isSyncing,
    pendingQueue,
  }
}
