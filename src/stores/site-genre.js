import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { API_BASE_URL } from 'src/config/api'
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
      const response = await axios.get(`${API_BASE_URL}/genres/${langQuery}`)
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

  function getGenresByPostCount(minCount = 0) {
    return genres.value.filter(genre => genre.posts_count >= minCount)
  }

  function getTopGenres(limit = 10) {
    return genres.value
      .sort((a, b) => b.posts_count - a.posts_count)
      .slice(0, limit)
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
    searchGenres,
    getGenresByPostCount,
    getTopGenres
  }
})
