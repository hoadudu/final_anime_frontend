// src/composables/watch-anime/useWatchPageData.js
import { useQuery } from '@tanstack/vue-query'
import { unref } from 'vue'
import api from 'axios'
import { API_BASE_URL } from 'src/config/api'
import { getLangQuery } from 'src/utils/lang'

const langQuery = getLangQuery()

export function useWatchPageDataSingleEpisode(episodeId) {
  return useQuery({
    queryKey: ['watch-page-single-episode', episodeId, langQuery],
    queryFn: async () => {
      const id = unref(episodeId)
      const response = await api.get(`${API_BASE_URL}/anime/watch/episode/${id}${langQuery}`)
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
    queryKey: ['watch-page-list-episodes', postId, langQuery],
    queryFn: async () => {
      const id = unref(postId)
      const response = await api.get(`${API_BASE_URL}/anime/${id}/episodes${langQuery}`)
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
