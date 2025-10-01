// src/composables/home-page/useHomePageData.js
import { useQuery } from '@tanstack/vue-query'
import api from 'axios'
import { API_BASE_URL } from 'src/config/api'
import { getLangQuery } from 'src/utils/lang'

const langQuery = getLangQuery()

export function useHomePageHeroSectionData() {
    return useQuery({
        queryKey: ['home-page-hero-section', langQuery],
        queryFn: async () => {
            const response = await api.get(`${API_BASE_URL}/home-page/hero-section${langQuery}`)
            return response.data
        },
        staleTime: 1000 * 60 * 60, // 1 giờ
        cacheTime: 1000 * 60 * 60 * 24, // 24 giờ
    })
}

export function useHomePageTrendingCarouselData() {
    return useQuery({
        queryKey: ['home-page-trending-carousel', langQuery],
        queryFn: async () => {
            const response = await api.get(`${API_BASE_URL}/home-page/trending-carousel${langQuery}`)
            return response.data
        },
        staleTime: 1000 * 60 * 60, // 1 giờ
        cacheTime: 1000 * 60 * 60 * 24, // 24 giờ
    })
}

export function useHomePageAnimeFeaturedTopAiringData() {
    return useQuery({
        queryKey: ['home-page-top-airing', langQuery],
        queryFn: async () => {
            const response = await api.get(API_BASE_URL + '/home-page/top-airing' + langQuery)
            return response.data
        },
        staleTime: 1000 * 60 * 60, // 1 giờ
        cacheTime: 1000 * 60 * 60 * 24, // 24 giờ
    })
}

export function useHomePageAnimeFeaturedMostPopularData() {
    return useQuery({
        queryKey: ['home-page-most-popular', langQuery],
        queryFn: async () => {
            const response = await api.get(API_BASE_URL + '/home-page/most-popular' + langQuery)
            return response.data
        },
        staleTime: 1000 * 60 * 60, // 1 giờ
        cacheTime: 1000 * 60 * 60 * 24, // 24 giờ
    })
}

export function useHomePageAnimeFeaturedMostLikedData() {
    return useQuery({
        queryKey: ['home-page-most-liked', langQuery],
        queryFn: async () => {
            const response = await api.get(API_BASE_URL + '/home-page/most-liked' + langQuery)
            return response.data
        },
        staleTime: 1000 * 60 * 60, // 1 giờ
        cacheTime: 1000 * 60 * 60 * 24, // 24 giờ
    })
}

export function useHomePageAnimeFeaturedLatestCompletedData() {
    return useQuery({
        queryKey: ['home-page-latest-completed', langQuery],
        queryFn: async () => {
            const response = await api.get(API_BASE_URL + '/home-page/latest-completed' + langQuery)
            return response.data
        },
        staleTime: 1000 * 60 * 60, // 1 giờ
        cacheTime: 1000 * 60 * 60 * 24, // 24 giờ
    })
}

export function useHomePageLastestEpisodePostsData() {
    return useQuery({
        queryKey: ['home-page-latest-episode-posts', langQuery],
        queryFn: async () => {
            const response = await api.get(API_BASE_URL + '/home-page/latest-episode-posts' + langQuery)
            return response.data
        },
        staleTime: 1000 * 60 * 60, // 1 giờ
        cacheTime: 1000 * 60 * 60 * 24, // 24 giờ
    })
}