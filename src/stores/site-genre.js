import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { API_BASE_URL } from 'src/config/api'
import { getLangQuery, getCurrentLang } from 'src/utils/lang'

const STORAGE_KEY = 'genres-data'
const CACHE_DURATION = 1000 * 60 * 60 // 1 hour

export const useGenreStore = defineStore('genre', () => {
  const genres = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const lastFetchTime = ref(0)

  // Cache helpers
  function getStorageKey() {
    return `${STORAGE_KEY}-${getCurrentLang()}`
  }

  function isCacheExpired(timestamp) {
    if (!timestamp) return true
    const now = Date.now()
    return (now - timestamp) > CACHE_DURATION
  }

  function loadFromLocalStorage() {
    if (!process.env.CLIENT) return false

    try {
      const cached = localStorage.getItem(getStorageKey())
      if (cached) {
        const data = JSON.parse(cached)

        // Check if cache expired
        if (isCacheExpired(data.timestamp)) {
          localStorage.removeItem(getStorageKey())
          return false
        }

        // Validate data
        if (data.genres && Array.isArray(data.genres)) {
          genres.value = data.genres
          lastFetchTime.value = data.timestamp
          return true
        }
      }
    } catch (err) {
      console.error('Failed to load genres from localStorage:', err)
      try {
        localStorage.removeItem(getStorageKey())
      } catch (cleanupErr) {
        console.debug('Failed to remove corrupted cache:', cleanupErr)
      }
    }
    return false
  }

  function saveToLocalStorage() {
    if (!process.env.CLIENT) return

    try {
      const data = {
        genres: genres.value,
        timestamp: Date.now()
      }
      localStorage.setItem(getStorageKey(), JSON.stringify(data))
    } catch (err) {
      console.error('Failed to save genres to localStorage:', err)
    }
  }

  function clearCache() {
    if (!process.env.CLIENT) return

    try {
      localStorage.removeItem(`${STORAGE_KEY}-vi-VN`)
      localStorage.removeItem(`${STORAGE_KEY}-en-US`)
      genres.value = []
      lastFetchTime.value = 0
    } catch (err) {
      console.error('Failed to clear genres cache:', err)
    }
  }

  async function fetchGenres(forceRefresh = false) {
    // If not forcing refresh and we have valid cache, use it
    if (!forceRefresh) {
      // Check if we already have data and it's not expired
      if (genres.value.length > 0 && !isCacheExpired(lastFetchTime.value)) {
        return
      }

      // Try to load from localStorage
      if (loadFromLocalStorage()) {
        return
      }
    }

    // Prevent concurrent fetches
    if (isLoading.value) {
      return
    }

    isLoading.value = true
    error.value = null

    const langQuery = getLangQuery()

    try {
      const response = await axios.get(`${API_BASE_URL}/genres/${langQuery}`)
      genres.value = response.data
      lastFetchTime.value = Date.now()

      // Save to localStorage after successful fetch
      saveToLocalStorage()
    } catch (err) {
      console.error('Error fetching genres:', err)
      error.value = 'Failed to load genres'

      // Try to load from cache as fallback
      if (!loadFromLocalStorage()) {
        genres.value = []
      }
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
    lastFetchTime,

    // Actions
    fetchGenres,
    getGenreById,
    getGenresByCategory,
    searchGenres,
    getGenresByPostCount,
    getTopGenres,
    clearCache,
    loadFromLocalStorage,
    saveToLocalStorage
  }
})
