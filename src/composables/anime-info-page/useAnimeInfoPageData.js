// src/composables/anime-info-page/useAnimeInfoPageData.js
import { useQuery } from '@tanstack/vue-query'
import { unref } from 'vue'
import api from 'axios'
import { API_BASE_URL } from 'src/config/api'
import { getLangQuery } from 'src/utils/lang'

const langQuery = getLangQuery();

export function useAnimeInfoPageData(animeId) {
  return useQuery({
    queryKey: ['anime-info', animeId, langQuery],
    queryFn: async () => {
      const id = unref(animeId) // Unwrap ref/computed
      // console.log('Fetching anime info for ID:', id) // Debug log
      const response = await api.get(`${API_BASE_URL}/anime/info/${id}${langQuery}`)
      // console.log('API Response:', response.data) // Debug response
      // Return the data object from response
      return response.data.data || response.data
    },
    staleTime: 1000 * 60 * 30, // 30 phút
    cacheTime: 1000 * 60 * 60 * 2, // 2 giờ
    enabled: !!animeId && process.env.CLIENT, // Chỉ chạy khi có animeId và trên client
    meta: {
      persist: false, // 🚫 không lưu query này vào localStorage
    },
  })
}

// Alias for backward compatibility
export const useAnimeInfoData = useAnimeInfoPageData

export function useAnimeRecommendationsData(animeId) {
  return useQuery({
    queryKey: ['anime-recommendations', animeId, langQuery],
    queryFn: async () => {
      const id = unref(animeId)
      const response = await api.get(`${API_BASE_URL}/anime/info/${id}/recommendations${langQuery}`)
      return response.data
    },
    staleTime: 1000 * 60 * 60, // 1 giờ
    cacheTime: 1000 * 60 * 60 * 4, // 4 giờ
    enabled: !!unref(animeId),
  })
}

export function useAnimeCharactersData(animeId) {
  return useQuery({
    queryKey: ['anime-characters', animeId, langQuery],
    queryFn: async () => {
      const id = unref(animeId)
      const response = await api.get(`${API_BASE_URL}/anime-info/${id}/characters${langQuery}`)
      return response.data
    },
    staleTime: 1000 * 60 * 60, // 1 giờ
    cacheTime: 1000 * 60 * 60 * 4, // 4 giờ
    enabled: !!unref(animeId),
  })
}
