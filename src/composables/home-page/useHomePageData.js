// src/composables/home-page/useHomePageData.js
import { useQuery } from '@tanstack/vue-query'
import api from 'axios'
import { API_BASE_URL } from 'src/config/api'
import { buildUrlWithParams } from 'src/utils/lang'

export function useHomePageHeroSectionData() {
  return useQuery({
    queryKey: ['home-page-hero-section'],
    queryFn: async () => {
      const url = buildUrlWithParams(`${API_BASE_URL}/home-page/hero-section`)
      const response = await api.get(url)
      return response.data
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 1000 * 60 * 60, // 1 giờ - data được coi là fresh trong 1 giờ
    gcTime: 1000 * 60 * 60 * 24, // 24 giờ - giữ cache trong bộ nhớ
    refetchOnMount: false, // Không fetch lại khi component mount nếu data vẫn fresh
    refetchOnWindowFocus: false, // Không fetch lại khi window focus
    refetchOnReconnect: false, // Không fetch lại khi reconnect internet
  })
}

export function useHomePageTrendingCarouselData() {
  return useQuery({
    queryKey: ['home-page-trending-carousel'],
    queryFn: async () => {
      const url = buildUrlWithParams(`${API_BASE_URL}/home-page/trending-carousel`)
      const response = await api.get(url)
      return response.data
    },
    staleTime: 1000 * 60 * 60, // 1 giờ
    cacheTime: 1000 * 60 * 60 * 24, // 24 giờ
  })
}

export function useHomePageAnimeFeaturedTopAiringData() {
  return useQuery({
    queryKey: ['home-page-top-airing'],
    queryFn: async () => {
      const url = buildUrlWithParams(`${API_BASE_URL}/home-page/top-airing`)
      const response = await api.get(url)
      return response.data
    },
    staleTime: 1000 * 60 * 60, // 1 giờ
    cacheTime: 1000 * 60 * 60 * 24, // 24 giờ
  })
}

export function useHomePageAnimeFeaturedMostPopularData() {
  return useQuery({
    queryKey: ['home-page-most-popular'],
    queryFn: async () => {
      const url = buildUrlWithParams(`${API_BASE_URL}/home-page/most-popular`)
      const response = await api.get(url)
      return response.data
    },
    staleTime: 1000 * 60 * 60, // 1 giờ
    cacheTime: 1000 * 60 * 60 * 24, // 24 giờ
  })
}

export function useHomePageAnimeFeaturedMostLikedData() {
  return useQuery({
    queryKey: ['home-page-most-liked'],
    queryFn: async () => {
      const url = buildUrlWithParams(`${API_BASE_URL}/home-page/most-liked`)
      const response = await api.get(url)
      return response.data
    },
    staleTime: 1000 * 60 * 60, // 1 giờ
    cacheTime: 1000 * 60 * 60 * 24, // 24 giờ
  })
}

export function useHomePageAnimeFeaturedLatestCompletedData() {
  return useQuery({
    queryKey: ['home-page-latest-completed'],
    queryFn: async () => {
      const url = buildUrlWithParams(`${API_BASE_URL}/home-page/latest-completed`)
      const response = await api.get(url)
      return response.data
    },
    staleTime: 1000 * 60 * 60, // 1 giờ
    cacheTime: 1000 * 60 * 60 * 24, // 24 giờ
  })
}

export function useHomePageLastestEpisodePostsData() {
  return useQuery({
    queryKey: ['home-page-latest-episode-posts'],
    queryFn: async () => {
      const url = buildUrlWithParams(`${API_BASE_URL}/home-page/latest-episode-posts`)
      const response = await api.get(url)
      return response.data
    },
    staleTime: 1000 * 60 * 60, // 1 giờ
    cacheTime: 1000 * 60 * 60 * 24, // 24 giờ
  })
}
