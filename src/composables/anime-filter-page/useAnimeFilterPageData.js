import { useQuery } from '@tanstack/vue-query'
import api from 'axios'
import { API_BASE_URL } from 'src/config/api'
import { buildUrlWithParams } from 'src/utils/lang'
import { computed } from 'vue'

/**
 * Hook lấy danh sách anime có filter
 * @param {Object} filters - các bộ lọc
 * @param {Ref} filters.page
 * @param {Ref} filters.sort
 * @param {Ref} filters.type
 * @param {Ref} filters.status
 * @param {Ref} filters.season
 * @param {Ref} filters.year
 * @param {Ref} filters.genres
 * @param {Ref} filters.genreSlug - optional, chỉ dùng khi filter theo genre cụ thể
 */
export function useAnimeFilterPageData(filters) {
  return useQuery({
    queryKey: computed(() => [
      'anime-filter-page',
      filters.page?.value,
      filters.sort?.value,
      filters.type?.value,
      filters.status?.value,
      filters.season?.value,
      filters.year?.value,
      filters.genres?.value,
      filters.genreSlug?.value,
    ]),
    queryFn: async () => {
      // Tạo params object
      const params = {}

      if (filters.page?.value) params.page = filters.page.value
      if (filters.sort?.value) params.sort = filters.sort.value
      if (filters.type?.value) params.type = filters.type.value
      if (filters.status?.value) params.status = filters.status.value
      if (filters.season?.value) params.season = filters.season.value
      if (filters.year?.value) params.year = filters.year.value
      if (filters.genres?.value) params.genres = filters.genres.value // ví dụ: "1,2,3"

      // Tạo URL dựa trên việc có genre slug hay không
      let baseUrl
      if (filters.genreSlug?.value) {
        // Filter theo genre cụ thể
        baseUrl = `${API_BASE_URL}/anime/filter/${filters.genreSlug.value}`
      } else {
        // Filter tổng quát không theo genre
        baseUrl = `${API_BASE_URL}/anime/filter`
      }

      // Build URL an toàn với params
      const url = buildUrlWithParams(baseUrl, params)

      const response = await api.get(url)
      return response.data
    },
    staleTime: 1000 * 60 * 30, // 30 phút
    cacheTime: 1000 * 60 * 60 * 2, // 2 giờ
    enabled: computed(() => !!filters.page?.value),
    meta: {
      persist: false, // 🚫 không lưu query này vào localStorage
    },
  })
}
