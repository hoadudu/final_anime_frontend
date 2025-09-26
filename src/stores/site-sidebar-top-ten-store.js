import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { API_MOCK_URL } from 'src/config/api'
import { getLangQuery } from 'src/utils/lang'
import api from 'axios'

const langQuery = getLangQuery()

export const useSiteSidebarTopTenStore = defineStore('siteSidebarTopTen', () => {
    const topTenData = reactive({
        day: [],
        week: [],
        month: [],
        year: [],
        all: []
    })
    const isLoading = ref(false)
    const error = ref(null)

    const fetchTopTen = async () => {
        isLoading.value = true
        error.value = null

        try {
            const response = await api.get(`${API_MOCK_URL}/top-ten-animes` + langQuery)

            if (response.data) {
                topTenData.day = response.data.day || []
                topTenData.week = response.data.week || []
                topTenData.month = response.data.month || []
                topTenData.year = response.data.year || []
                topTenData.all = response.data.all || []
            }
        } catch (err) {
            console.error('Error fetching top ten:', err)
            error.value = 'Failed to load top 10 data'
        } finally {
            isLoading.value = false
        }
    }

    return {
        topTenData,
        isLoading,
        error,
        fetchTopTen
    }
})

// Note: This store handles different time periods for top anime rankings

