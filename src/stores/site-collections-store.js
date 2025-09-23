import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from 'axios'
import { baseURL } from 'src/config/api'
import { getLangQuery } from 'src/utils/lang'


export const useHeroSectionStore = defineStore('heroSection', () => {
  const featuredMovies = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const langQuery = getLangQuery()

  async function fetchFeaturedMovies() {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.get(`${baseURL}/collections/featured-animes${langQuery}`)
      featuredMovies.value = response.data
    } catch (err) {
      console.error('Error fetching featured movies:', err)
      error.value = 'Failed to load featured movies'
      // Fallback data for development
      featuredMovies.value = []
    } finally {
      isLoading.value = false
    }
  }

  return {
    featuredMovies,
    isLoading,
    error,
    fetchFeaturedMovies
  }
})

export const useTrendingCarouselStore = defineStore('trending-carousel', () => {
  const trendingMovies = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const langQuery = getLangQuery()

  async function fetchTrendingMovies() {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.get(`${baseURL}/collections/trending-animes${langQuery}`)
      trendingMovies.value = response.data
    } catch (err) {
      console.error('Error fetching trending movies:', err)
      error.value = 'Failed to load trending movies'
      // Fallback data for development
      trendingMovies.value = []
    } finally {
      isLoading.value = false
    }
  }

  return {
    trendingMovies,
    isLoading,
    error,
    fetchTrendingMovies
  }
})