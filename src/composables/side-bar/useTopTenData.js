// composables/useTopTenData.js
import { useQuery } from '@tanstack/vue-query'
import api from 'axios'
import { API_BASE_URL } from 'src/config/api'
import { getLangQuery } from 'src/utils/lang'

const langQuery = getLangQuery()

export function useTopTenData() {
    return useQuery({
        queryKey: ['sidebar-top-ten', langQuery],
        queryFn: async () => {
            const response = await api.get(`${API_BASE_URL}/sidebar/top-anime${langQuery}`)
            return response.data
        },
        staleTime: 1000 * 60 * 60, // 1 giờ
        cacheTime: 1000 * 60 * 60 * 24, // 24 giờ
    })
}