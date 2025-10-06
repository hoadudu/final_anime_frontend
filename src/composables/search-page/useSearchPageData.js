// src/composables/search-page/useSearchPageData.js
import { useQuery } from '@tanstack/vue-query'
import api from 'axios'
import { API_BASE_URL } from 'src/config/api'
import { getLangQuery } from 'src/utils/lang'
import { computed } from 'vue'

const langQuery = getLangQuery().replace('?lang=', '&lang=')

/**
 * Hook để fetch dữ liệu tìm kiếm anime
 * @param {Ref<string>} keyword - Từ khóa tìm kiếm
 * @param {Ref<number>} page - Số trang hiện tại
 * @returns {Object} Vue Query result với data, isLoading, error, refetch
 */
export function useSearchPageData(keyword, page) {
  return useQuery({
    queryKey: computed(() => ['search-page', keyword.value, page.value, langQuery]),
    queryFn: async () => {
      // Không fetch nếu không có keyword
      if (!keyword.value) {
        return null
      }

      const response = await api.get(
        `${API_BASE_URL}/search/full/?keyword=${keyword.value}&page=${page.value}${langQuery}`,
      )
      return response.data
    },
    enabled: computed(() => !!keyword.value), // Chỉ fetch khi có keyword
    staleTime: 1000 * 60 * 5, // 5 phút
    cacheTime: 1000 * 60 * 30, // 30 phút
    meta: {
      persist: false, // 🚫 không lưu query này vào localStorage
    },
  })
}
