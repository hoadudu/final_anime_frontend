import { defineStore } from 'pinia'
import { ref } from 'vue'
import { API_BASE_URL } from 'src/config/api'
import { getLangQuery } from 'src/utils/lang'
import api from 'axios'

const langQuery = getLangQuery()

export const useLatestEpisodePostsStore = defineStore('latestEpisodes', () => {
  // State
  const latestEpisodePosts = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const lastFetched = ref(null) // Thêm timestamp cache
  const cacheTimeout = 10 * 60 * 1000 // 10 phút tính bằng milliseconds

  // Computed
  const needsRefresh = () => {
    if (!lastFetched.value) return true
    const now = Date.now()
    return (now - lastFetched.value) > cacheTimeout
  }

  const isDataFresh = () => {
    return !needsRefresh() && latestEpisodePosts.value.length > 0
  }

  // Actions
  const fetchLatestEpisodePosts = async (forceRefresh = false) => {
    // Kiểm tra cache nếu không force refresh
    if (!forceRefresh && isDataFresh()) {
      console.log('Latest episodes: Using cached data')
      return latestEpisodePosts.value
    }

    isLoading.value = true
    error.value = null
    
    try {
      console.log('Latest episodes: Fetching from API')
      const response = await api.get(API_BASE_URL + '/home-page/latest-episode-posts' + langQuery)
      
      latestEpisodePosts.value = response.data?.data || []
      lastFetched.value = Date.now() // Cập nhật timestamp
      error.value = null

      return latestEpisodePosts.value
    } catch (err) {
      console.error('Failed to fetch latest episode posts:', err)
      error.value = err.message || 'Failed to fetch latest episode posts'
      
      // Nếu có data cũ và lỗi không phải network, vẫn return data cũ
      if (latestEpisodePosts.value.length > 0 && err.code !== 'NETWORK_ERROR') {
        console.warn('Using stale data due to API error')
        return latestEpisodePosts.value
      }
      
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Refresh data (force)
  const refreshLatestEpisodePosts = async () => {
    return await fetchLatestEpisodePosts(true)
  }

  // Clear cache
  const clearCache = () => {
    latestEpisodePosts.value = []
    lastFetched.value = null
    error.value = null
  }

  // Get cache info for debugging
  const getCacheInfo = () => {
    return {
      hasData: latestEpisodePosts.value.length > 0,
      lastFetched: lastFetched.value,
      cacheAge: lastFetched.value ? Date.now() - lastFetched.value : 0,
      isExpired: needsRefresh(),
      isFresh: isDataFresh()
    }
  }

  return {
    // State
    latestEpisodePosts,
    isLoading,
    error,
    lastFetched,
    
    // Getters
    needsRefresh,
    isDataFresh,
    getCacheInfo,
    
    // Actions
    fetchLatestEpisodePosts,
    refreshLatestEpisodePosts,
    clearCache
  }
})