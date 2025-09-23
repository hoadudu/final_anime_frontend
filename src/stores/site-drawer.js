import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { getLangQuery } from 'src/utils/lang'
import { API_BASE_URL } from 'src/config/api'


export const useDrawerStore = defineStore('drawer', () => {
  // state
  
  const links = ref([])
  const buttons = ref([])
  const loading = ref(false)
  const error = ref(null)
  const leftDrawerOpen = ref(false)
  const language = ref(localStorage.getItem('app-language') || 'en-US')
  
  const languageOptions = ref([
    { label: 'English', value: 'en-US' },
    { label: 'Tiếng Việt', value: 'vi-VN' }
  ])

  // actions
  
  async function fetchDrawerData() {
    loading.value = true
    error.value = null
    try {
      const res = await axios.get(`${API_BASE_URL}/drawer${getLangQuery()}`)
      links.value = res.data.links
      buttons.value = res.data.buttons
    } catch (err) {
      error.value = err.message || 'Failed to fetch drawer data'
    } finally {
      loading.value = false
    }
  }

  async function fetchGenresData() {
    loading.value = true
    error.value = null
    try {
      const res = await axios.get(`${API_BASE_URL}/genres${getLangQuery()}`)
      links.value = res.data.links
      buttons.value = res.data.buttons
    } catch (err) {
      error.value = err.message || 'Failed to fetch genres'
    } finally {
      loading.value = false
    }
  }

  function setLanguage(newLanguage) {
    language.value = newLanguage
    localStorage.setItem('app-language', newLanguage)    
  }

  function toggleLeftDrawer() {
    leftDrawerOpen.value = !leftDrawerOpen.value
  }

  function openLeftDrawer() {
    leftDrawerOpen.value = true
  }

  function closeLeftDrawer() {
    leftDrawerOpen.value = false
  }

  // getters
  const linkCount = computed(() => links.value.length)
  const firstLink = computed(() => links.value[0] || null)
  const buttonCount = computed(() => buttons.value.length)
  const firstButton = computed(() => buttons.value[0] || null)

  return {
    // state
    links,
    buttons,
    loading,
    error,
    leftDrawerOpen,
    language,
    languageOptions,

    // actions
    fetchDrawerData,
    fetchGenresData,
    toggleLeftDrawer,
    openLeftDrawer,
    closeLeftDrawer,
    setLanguage,

    // getters
    linkCount,
    firstLink,
    buttonCount,
    firstButton
  }
})
