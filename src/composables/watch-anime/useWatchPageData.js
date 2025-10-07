// src/composables/watch-anime/useWatchPageData.js
import { useQuery } from '@tanstack/vue-query'
import { unref } from 'vue'
import api from 'axios'
import { API_BASE_URL } from 'src/config/api'
import { buildUrlWithParams } from 'src/utils/lang'

export function useWatchPageDataSingleEpisode(episodeId) {
  return useQuery({
    queryKey: ['watch-page-single-episode', episodeId],
    queryFn: async () => {
      const id = unref(episodeId)
      const url = buildUrlWithParams(`${API_BASE_URL}/anime/watch/episode/${id}`)
      const response = await api.get(url)
      return response.data
    },
    staleTime: 1000 * 60 * 60, // 1 giờ
    cacheTime: 1000 * 60 * 60 * 24, // 24 giờ
    enabled: !!unref(episodeId),
    meta: {
      persist: false, // 🚫 không lưu query này vào localStorage
    },
  })
}

export function useWatchPageDataListEpisodes(postId) {
  return useQuery({
    queryKey: ['watch-page-list-episodes', postId],
    queryFn: async () => {
      const id = unref(postId)
      if (!id) {
        return { groups: [] }
      }
      const url = buildUrlWithParams(`${API_BASE_URL}/anime/${id}/episodes`)
      const response = await api.get(url)
      return response.data
    },
    staleTime: 1000 * 60 * 60, // 1 giờ
    cacheTime: 1000 * 60 * 60 * 24, // 24 giờ
    enabled: !!unref(postId),
    meta: {
      persist: false, // 🚫 không lưu query này vào localStorage
    },
  })
}
