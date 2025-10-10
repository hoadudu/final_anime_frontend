// src/composables/profile-page/useProfilePageData.js
import { useQuery } from '@tanstack/vue-query'
import api from 'axios'
import { API_BASE_URL } from 'src/config/api'
import { computed } from 'vue'

/**
 * Hook để fetch thông tin profile của user
 * @param {Ref<number>} userId - ID của user
 * @returns {Object} Vue Query result với data, isLoading, error, refetch
 */
export function useProfileData(userId) {
    return useQuery({
        queryKey: computed(() => ['profile', userId.value]),
        queryFn: async () => {
            if (!userId.value) {
                return null
            }

            const response = await api.get(`${API_BASE_URL}/profile/${userId.value}`)

            return response.data
        },
        enabled: computed(() => !!userId.value),
        staleTime: 1000 * 60 * 5, // 5 phút
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
        queryKey: computed(() => ['profile-anime-list', userId.value, status.value, page.value]),
        queryFn: async () => {
            if (!userId.value || !status.value) {
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
        enabled: computed(() => !!userId.value && !!status.value),
        staleTime: 1000 * 60 * 2, // 2 phút
    })
}

/**
 * Hook để fetch custom lists
 * @param {Ref<number>} userId - ID của user
 * @returns {Object} Vue Query result với data, isLoading, error, refetch
 */
export function useProfileCustomLists(userId) {
    return useQuery({
        queryKey: computed(() => ['profile-custom-lists', userId.value]),
        queryFn: async () => {
            if (!userId.value) {
                return null
            }

            const response = await api.get(`${API_BASE_URL}/profile/${userId.value}/custom_lists`)

            return response.data
        },
        enabled: computed(() => !!userId.value),
        staleTime: 1000 * 60 * 5, // 5 phút
    })
}

