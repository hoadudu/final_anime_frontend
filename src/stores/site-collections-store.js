import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from 'axios'
import { API_BASE_URL } from 'src/config/api'
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
      const response = await api.get(`${API_BASE_URL}/collections/featured-animes${langQuery}`)
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
      const response = await api.get(`${API_BASE_URL}/collections/trending-animes${langQuery}`)
      // console.log('API Response:', response.data)
      
      // Ensure the response data is an array
      if (Array.isArray(response.data)) {
        trendingMovies.value = response.data
      } else {
        // If it's not an array, check if it's in a nested property
        if (response.data && Array.isArray(response.data.data)) {
          trendingMovies.value = response.data.data
        } else if (response.data && typeof response.data === 'object') {
          // If it's an object with various properties, try to find an array
          for (const key in response.data) {
            if (Array.isArray(response.data[key])) {
              trendingMovies.value = response.data[key]
              break
            }
          }
        } else {
          console.error('Unexpected response format:', response.data)
          error.value = 'Unexpected data format from API'
          trendingMovies.value = []
        }
      }
      
      // Add fallback data if needed
      if (trendingMovies.value.length === 0) {
        console.log('Using fallback data')
        trendingMovies.value = [
          {
            "id": 6149,
            "title": "Vua Hải Tặc",
            "posterUrl": "https://cdn.noitatnemucod.net/thumbnail/300x400/100/default.jpg",
            "rank": 1,
            "slug": "vua-hai-tac",
            "description": "",
            "aired": "",
            "status": "finished_airing",
            "genres": ["Action", "Adventure", "Comedy", "Drama", "Fantasy"]
          }
        ]
      }
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