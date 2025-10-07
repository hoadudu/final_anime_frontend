// src/composables/anime-info-page/useAnimeInfoPageData.js
import { useQuery } from '@tanstack/vue-query'
import { unref } from 'vue'
import api from 'axios'
import { API_BASE_URL } from 'src/config/api'
import { buildUrlWithParams } from 'src/utils/lang'

export function useAnimeInfoPageData(animeId) {
  return useQuery({
    queryKey: ['anime-info', animeId],
    queryFn: async () => {
      const id = unref(animeId) // Unwrap ref/computed
      const url = buildUrlWithParams(`${API_BASE_URL}/anime/info/${id}`)
      const response = await api.get(url)
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
    queryKey: ['anime-recommendations', animeId],
    queryFn: async () => {
      const id = unref(animeId)
      const url = buildUrlWithParams(`${API_BASE_URL}/anime/info/${id}/recommendations`)
      const response = await api.get(url)
      return response.data
    },
    staleTime: 1000 * 60 * 60, // 1 giờ
    cacheTime: 1000 * 60 * 60 * 4, // 4 giờ
    enabled: !!unref(animeId),
  })
}

export function useAnimeCharactersData(animeId) {
  return useQuery({
    queryKey: ['anime-characters', animeId],
    queryFn: async () => {
      const id = unref(animeId)
      const url = buildUrlWithParams(`${API_BASE_URL}/anime-info/${id}/characters`)
      const response = await api.get(url)
      return response.data
    },
    staleTime: 1000 * 60 * 60, // 1 giờ
    cacheTime: 1000 * 60 * 60 * 4, // 4 giờ
    enabled: !!unref(animeId),
  })
}
