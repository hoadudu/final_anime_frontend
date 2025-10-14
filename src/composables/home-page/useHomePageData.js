// src/composables/home-page/useHomePageData.js
import { useQuery } from '@tanstack/vue-query'
import api from 'axios'
import { API_BASE_URL } from 'src/config/api'
import { buildUrlWithParams } from 'src/utils/lang'
import { queryKeys } from 'src/utils/queryKeys'
import { STATIC_QUERY_CONFIG } from 'src/utils/queryConfig'

export function useHomePageHeroSectionData() {
  return useQuery({
    queryKey: queryKeys.home.heroSection(),
    queryFn: async () => {
      const url = buildUrlWithParams(`${API_BASE_URL}/home-page/hero-section`)
      const response = await api.get(url)
      return response.data
    },
    ...STATIC_QUERY_CONFIG,
  })
}

export function useHomePageTrendingCarouselData() {
  return useQuery({
    queryKey: queryKeys.home.trending(),
    queryFn: async () => {
      const url = buildUrlWithParams(`${API_BASE_URL}/home-page/trending-carousel`)
      const response = await api.get(url)
      return response.data
    },
    ...STATIC_QUERY_CONFIG,
  })
}

export function useHomePageAnimeFeaturedTopAiringData() {
  return useQuery({
    queryKey: queryKeys.home.topAiring(),
    queryFn: async () => {
      const url = buildUrlWithParams(`${API_BASE_URL}/home-page/top-airing`)
      const response = await api.get(url)
      return response.data
    },
    ...STATIC_QUERY_CONFIG,
  })
}

export function useHomePageAnimeFeaturedMostPopularData() {
  return useQuery({
    queryKey: queryKeys.home.mostPopular(),
    queryFn: async () => {
      const url = buildUrlWithParams(`${API_BASE_URL}/home-page/most-popular`)
      const response = await api.get(url)
      return response.data
    },
    ...STATIC_QUERY_CONFIG,
  })
}

export function useHomePageAnimeFeaturedMostLikedData() {
  return useQuery({
    queryKey: queryKeys.home.mostLiked(),
    queryFn: async () => {
      const url = buildUrlWithParams(`${API_BASE_URL}/home-page/most-liked`)
      const response = await api.get(url)
      return response.data
    },
    ...STATIC_QUERY_CONFIG,
  })
}

export function useHomePageAnimeFeaturedLatestCompletedData() {
  return useQuery({
    queryKey: queryKeys.home.latestCompleted(),
    queryFn: async () => {
      const url = buildUrlWithParams(`${API_BASE_URL}/home-page/latest-completed`)
      const response = await api.get(url)
      return response.data
    },
    ...STATIC_QUERY_CONFIG,
  })
}

export function useHomePageLastestEpisodePostsData() {
  return useQuery({
    queryKey: queryKeys.home.latestEpisodes(),
    queryFn: async () => {
      const url = buildUrlWithParams(`${API_BASE_URL}/home-page/latest-episode-posts`)
      const response = await api.get(url)
      return response.data
    },
    ...STATIC_QUERY_CONFIG,
  })
}
