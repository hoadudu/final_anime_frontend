import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { API_BASE_URL } from 'src/config/api'

export const useSiteHomePageStore = defineStore('siteHomePage', () => {
  // State
  const trendingAnimes = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Actions
  const fetchTrendingAnimes = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.get(`${API_BASE_URL}/trending-animes`)
      trendingAnimes.value = response.data || []
    } catch (err) {
      error.value = err.message || 'Failed to fetch trending animes'
      console.error('Error fetching trending animes:', err)
      
      // Fallback data for development/demo purposes
      trendingAnimes.value = [
        {
          id: 6149,
          title: "One Piece",
          posterUrl: "https://cdn.noitatnemucod.net/thumbnail/300x400/100/default.jpg",
          rank: 1,
          slug: "vua-hai-tac"
        },
        {
          id: 8038,
          title: "Kaoru Hana wa Rin to Saku",
          posterUrl: "https://cdn.noitatnemucod.net/thumbnail/300x400/100/default.jpg", 
          rank: 2,
          slug: "kaoru-hana-wa-rin-to-saku"
        },
        {
          id: 7249,
          title: "Tensei shitara Dainana Ouji Datta node, Kimama ni Majutsu wo Kiwamemasu",
          posterUrl: "https://cdn.noitatnemucod.net/thumbnail/300x400/100/default.jpg",
          rank: 3,
          slug: "mushoku-tensei-ii-isekai-ittara-honki-dasu"
        },
        {
          id: 8041,
          title: "Dandadan 2nd Season",
          posterUrl: "https://cdn.noitatnemucod.net/thumbnail/300x400/100/default.jpg",
          rank: 4,
          slug: "dandadan-2nd-season"
        },
        {
          id: 8042,
          title: "Gochisoku",
          posterUrl: "https://cdn.noitatnemucod.net/thumbnail/300x400/100/default.jpg",
          rank: 5,
          slug: "gochisoku"
        },
        {
          id: 8043,
          title: "Sono Bisque Doll wa Koi wo Suru",
          posterUrl: "https://cdn.noitatnemucod.net/thumbnail/300x400/100/default.jpg",
          rank: 6,
          slug: "sono-bisque-doll-wa-koi-wo-suru"
        }
      ]
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  // Getters
  const getTrendingAnimeById = (id) => {
    return trendingAnimes.value.find(anime => anime.id === id)
  }

  const getTopTrendingAnimes = (limit = 6) => {
    return trendingAnimes.value.slice(0, limit)
  }

  return {
    // State
    trendingAnimes,
    loading,
    error,
    
    // Actions
    fetchTrendingAnimes,
    clearError,
    
    // Getters
    getTrendingAnimeById,
    getTopTrendingAnimes
  }
})
