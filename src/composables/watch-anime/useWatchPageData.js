// src/composables/watch-anime/useWatchPageData.js
import { useQuery } from '@tanstack/vue-query'
import { unref } from 'vue'
import api from 'axios'
import { API_BASE_URL } from 'src/config/api'
import { buildUrlWithParams } from 'src/utils/lang'
import { queryKeys } from 'src/utils/queryKeys'
import { CONTENT_QUERY_CONFIG } from 'src/utils/queryConfig'

export function useWatchPageDataSingleEpisode(episodeId) {
  return useQuery({
    queryKey: queryKeys.watch.episode(episodeId),
    queryFn: async () => {
      const id = unref(episodeId)
      const url = buildUrlWithParams(`${API_BASE_URL}/anime/watch/episode/${id}`)
      const response = await api.get(url)
      return response.data
    },
    ...CONTENT_QUERY_CONFIG,
    enabled: !!unref(episodeId),
  })
}

export function useWatchPageDataListEpisodes(postId) {
  return useQuery({
    queryKey: queryKeys.watch.episodeList(postId),
    queryFn: async () => {
      const id = unref(postId)
      if (!id) {
        return { groups: [] }
      }
      const url = buildUrlWithParams(`${API_BASE_URL}/anime/${id}/episodes`)
      const response = await api.get(url)
      return response.data
    },
    ...CONTENT_QUERY_CONFIG,
    enabled: !!unref(postId),
  })
}
