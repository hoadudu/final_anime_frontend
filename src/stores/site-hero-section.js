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