import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { baseURL } from 'src/config/api'
import { getLangQuery } from 'src/utils/lang'

export const useGenreStore = defineStore('genre', () => {
  const genres = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  async function fetchGenres() {
    isLoading.value = true
    error.value = null
    
    const langQuery = getLangQuery()
    
    try {
      const response = await axios.get(`${baseURL}/genres${langQuery}`)
      genres.value = response.data
    } catch (err) {
      console.error('Error fetching genres:', err)
      error.value = 'Failed to load genres'
      genres.value = []
    } finally {
      isLoading.value = false
    }
  }

  function getGenreById(id) {
    return genres.value.find(genre => genre.id === id)
  }

  function getGenresByCategory(category) {
    return genres.value.filter(genre => genre.category === category)
  }

  function searchGenres(query) {
    if (!query.trim()) return genres.value
    
    const searchTerm = query.toLowerCase().trim()
    return genres.value.filter(genre => 
      genre.name.toLowerCase().includes(searchTerm)
    )
  }

  return {
    // State
    genres,
    isLoading,
    error,
    
    // Actions
    fetchGenres,
    getGenreById,
    getGenresByCategory,
    searchGenres
  }
})
