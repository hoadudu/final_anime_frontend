import { defineStore } from 'pinia'
import { ref } from 'vue'
// import { API_MOCK_URL } from 'src/config/api'
import { API_BASE_URL } from 'src/config/api'
import { getLangQuery } from 'src/utils/lang'
import api from 'axios'
const langQuery = getLangQuery()

export const useAnimeFeaturedStore = defineStore('animeFeatured', () => {
  const isLoading = ref(false)
  const error = ref(null)
  
  const topAiring = ref([])
  const mostPopular = ref([])
  const mostLiked = ref([])
  const latestCompleted = ref([])

  const fetchTopAiring = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.get(API_BASE_URL + '/home-page/top-airing' + langQuery)
      topAiring.value = response.data?.data || []
    } catch (err) {
      console.error('Failed to fetch top airing anime:', err)
      error.value = 'Failed to fetch top airing anime'
    } finally {
      isLoading.value = false
    }
  }

  const fetchMostPopular = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.get(API_BASE_URL + '/home-page/most-popular-animes' + langQuery)
      mostPopular.value = response.data?.data || []
    } catch (err) {
      console.error('Failed to fetch most popular anime:', err)
      error.value = 'Failed to fetch most popular anime'
    } finally {
      isLoading.value = false
    }
  }

  const fetchMostLiked = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.get(API_BASE_URL + '/home-page/most-liked-animes' + langQuery)
      mostLiked.value = response.data?.data || []
    } catch (err) {
      console.error('Failed to fetch most liked anime:', err)
      error.value = 'Failed to fetch most liked anime'
    } finally {
      isLoading.value = false
    }
  }

  const fetchLatestCompleted = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.get(API_BASE_URL + '/home-page/latest-completed' + langQuery)
      latestCompleted.value = response.data?.data || []
    } catch (err) {
      console.error('Failed to fetch latest completed anime:', err)
      error.value = 'Failed to fetch latest completed anime'
    } finally {
      isLoading.value = false
    }
  }

  const fetchAllFeaturedData = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      await Promise.all([
        fetchTopAiring(),
        fetchMostPopular(),
        fetchMostLiked(),
        fetchLatestCompleted()
      ])
    } catch (err) {
      console.error('Failed to fetch featured anime data:', err)
      error.value = 'Failed to fetch featured anime data'
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    topAiring,
    mostPopular,
    mostLiked,
    latestCompleted,
    fetchTopAiring,
    fetchMostPopular,
    fetchMostLiked,
    fetchLatestCompleted,
    fetchAllFeaturedData
  }
})
