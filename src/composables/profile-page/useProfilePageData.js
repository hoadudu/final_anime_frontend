// src/composables/profile-page/useProfilePageData.js
import { useQuery } from '@tanstack/vue-query'
import api from 'axios'
import { API_BASE_URL } from 'src/config/api'
import { computed } from 'vue'
import { queryKeys } from 'src/utils/queryKeys'
import { USER_QUERY_CONFIG } from 'src/utils/queryConfig'

/**
 * Hook để fetch thông tin profile của user
 * @param {Ref<number>} userId - ID của user
 * @returns {Object} Vue Query result với data, isLoading, error, refetch
 */
export function useProfileData(userId) {
  return useQuery({
    queryKey: computed(() => queryKeys.user.profile(userId.value)),
    queryFn: async () => {
      if (!userId.value) {
        return null
      }

      const response = await api.get(`${API_BASE_URL}/profile/${userId.value}`)

      return response.data
    },
    ...USER_QUERY_CONFIG,
    enabled: computed(() => !!userId.value),
  })
}

/**
 * Hook để fetch anime list theo status
 * @param {Ref<number>} userId - ID của user
 * @param {Ref<string>} status - Status của anime (watching, completed, on_hold, dropped, plan_to_watch)
 * @param {Ref<number>} page - Số trang hiện tại
 * @returns {Object} Vue Query result với data, isLoading, error, refetch
 */
export function useProfileAnimeList(userId, status, page = { value: 1 }) {
  return useQuery({
    queryKey: computed(() => queryKeys.user.animeList(userId.value, status.value)),
    queryFn: async () => {
      if (!userId.value || !status.value) {
        return null
      }

      // Don't fetch data for settings tab
      if (status.value === 'settings') {
        return null
      }

      const params = {
        status: status.value,
      }

      if (page.value > 1) {
        params.page = page.value
      }

      const response = await api.get(`${API_BASE_URL}/profile/${userId.value}/list`, {
        params,
      })

      return response.data
    },
    ...USER_QUERY_CONFIG,
    enabled: computed(() => !!userId.value && !!status.value && status.value !== 'settings'),
  })
}

/**
 * Hook để fetch custom lists
 * @param {Ref<number>} userId - ID của user
 * @returns {Object} Vue Query result với data, isLoading, error, refetch
 */
export function useProfileCustomLists(userId) {
  return useQuery({
    queryKey: computed(() => [...queryKeys.user.profile(userId.value), 'custom-lists']),
    queryFn: async () => {
      if (!userId.value) {
        return null
      }

      const response = await api.get(`${API_BASE_URL}/profile/${userId.value}/custom_lists`)

      return response.data
    },
    ...USER_QUERY_CONFIG,
    enabled: computed(() => !!userId.value),
  })
}

