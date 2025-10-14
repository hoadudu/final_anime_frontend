// composables/useTopTenData.js
import { useQuery } from '@tanstack/vue-query'
import api from 'axios'
import { API_BASE_URL } from 'src/config/api'
import { buildUrlWithParams } from 'src/utils/lang'
import { queryKeys } from 'src/utils/queryKeys'
import { STATIC_QUERY_CONFIG } from 'src/utils/queryConfig'

export function useTopTenData() {
    return useQuery({
        queryKey: queryKeys.sidebar.topTen('anime'),
        queryFn: async () => {
            const url = buildUrlWithParams(`${API_BASE_URL}/sidebar/top-anime`)
            const response = await api.get(url)
            return response.data
        },
        ...STATIC_QUERY_CONFIG,
    })
}
