import { ref, watch, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import api from 'axios'
import { API_BASE_URL } from 'src/config/api'
import { buildUrlWithParams } from 'src/utils/lang'

/**
 * Hook để fetch dữ liệu live search anime với debouncing
 * @param {Ref<string>} keyword - Từ khóa tìm kiếm
 * @param {number} delay - Thời gian delay (ms) cho debounce
 */
export function useLiveSearchData(keyword, delay = 500) {
  // Ref để lưu keyword sau khi debounce
  const debouncedKeyword = ref('')
  let debounceTimer = null

  // Watch keyword và debounce
  watch(
    keyword,
    (newValue) => {
      // Clear timer cũ
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }

      // Set timer mới
      debounceTimer = setTimeout(() => {
        debouncedKeyword.value = newValue.trim()
      }, delay)
    },
    { immediate: true }
  )

  // Query với TanStack Query
  return useQuery({
    queryKey: computed(() => ['live-search', debouncedKeyword.value]),
    queryFn: async () => {
      if (!debouncedKeyword.value) {
        return null
      }

      // Build URL an toàn với params
      const url = buildUrlWithParams(`${API_BASE_URL}/search/live/`, {
        keyword: debouncedKeyword.value
      })

      const response = await api.get(url)
      return response.data
    },
    enabled: computed(() => !!debouncedKeyword.value && debouncedKeyword.value.length > 0),
    staleTime: 1000 * 60 * 2, // Cache 2 phút
    retry: 1, // Retry 1 lần nếu failed
    meta: { persist: false },
  })
}
