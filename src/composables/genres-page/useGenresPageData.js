// src/composables/genres-page/useGenresPageData.js
import { useQuery } from '@tanstack/vue-query'
import api from 'axios'
import { API_BASE_URL } from 'src/config/api'
import { buildUrlWithParams } from 'src/utils/lang'
import { computed } from 'vue'
import { queryKeys } from 'src/utils/queryKeys'
import { DYNAMIC_QUERY_CONFIG } from 'src/utils/queryConfig'

/**
 * Hook để fetch dữ liệu anime theo thể loại
 * @param {Ref<string>} genreSlug - Slug của thể loại
 * @param {Ref<number>} page - Số trang hiện tại
 * @param {Ref<string>} sort - Tùy chọn sắp xếp (oldest, title, rating, views, latest)
 * @returns {Object} Vue Query result với data, isLoading, error, refetch
 */
export function useGenresPageData(genreSlug, page, sort) {
  return useQuery({
    queryKey: computed(() => queryKeys.genre.detail(genreSlug.value)),
    queryFn: async () => {
      // Không fetch nếu không có genreSlug
      if (!genreSlug.value) {
        return null
      }

      // Tạo params object
      const params = {
        page: page.value
      }

      // Thêm tham số sort nếu có và khác mặc định
      if (sort.value && sort.value !== 'latest') {
        params.sort = sort.value
      }

      // Build URL an toàn với params
      const url = buildUrlWithParams(`${API_BASE_URL}/genres/${genreSlug.value}/anime`, params)

      const response = await api.get(url)

      // Transform response để phù hợp với cấu trúc mong đợi
      if (response.data && response.data.data) {
        return {
          genre: response.data.data.genre,
          results: response.data.data.posts || [],
          pagination: response.data.data.pagination,
          count: (response.data.data.pagination?.total || 0),
          total_pages: response.data.data.pagination?.last_page || 1,
          has_more: (response.data.data.pagination?.current_page || 0) < (response.data.data.pagination?.last_page || 1),
        }
      }

      return response.data
    },
    ...DYNAMIC_QUERY_CONFIG,
    enabled: computed(() => !!genreSlug.value), // Chỉ fetch khi có genreSlug
  })
}
