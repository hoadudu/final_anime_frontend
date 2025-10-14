// src/composables/anime-info-page/useAnimeInfoPageData.js
import { useQuery } from '@tanstack/vue-query'
import { unref } from 'vue'
import api from 'axios'
import { API_BASE_URL } from 'src/config/api'
import { buildUrlWithParams } from 'src/utils/lang'
import { queryKeys } from 'src/utils/queryKeys'
import { CONTENT_QUERY_CONFIG } from 'src/utils/queryConfig'

export function useAnimeInfoPageData(animeId) {
  return useQuery({
    queryKey: queryKeys.anime.info(animeId),
    queryFn: async () => {
      const id = unref(animeId) // Unwrap ref/computed
      const url = buildUrlWithParams(`${API_BASE_URL}/anime/info/${id}`)
      const response = await api.get(url)
      // Return the data object from response
      return response.data.data || response.data
    },
    ...CONTENT_QUERY_CONFIG,
    enabled: !!animeId && process.env.CLIENT, // Chỉ chạy khi có animeId và trên client
  })
}

// Alias for backward compatibility
export const useAnimeInfoData = useAnimeInfoPageData

export function useAnimeRecommendationsData(animeId) {
  return useQuery({
    queryKey: queryKeys.anime.recommendations(animeId),
    queryFn: async () => {
      const id = unref(animeId)
      const url = buildUrlWithParams(`${API_BASE_URL}/anime/info/${id}/recommendations`)
      const response = await api.get(url)
      return response.data
    },
    ...CONTENT_QUERY_CONFIG,
    enabled: !!unref(animeId),
  })
}

export function useAnimeCharactersData(animeId) {
  return useQuery({
    queryKey: queryKeys.anime.characters(animeId),
    queryFn: async () => {
      const id = unref(animeId)
      const url = buildUrlWithParams(`${API_BASE_URL}/anime-info/${id}/characters`)
      const response = await api.get(url)
      return response.data
    },
    ...CONTENT_QUERY_CONFIG,
    enabled: !!unref(animeId),
  })
}
