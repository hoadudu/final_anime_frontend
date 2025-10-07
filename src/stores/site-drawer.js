import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { getLangQuery, getCurrentLang } from 'src/utils/lang'
import { API_BASE_URL } from 'src/config/api'

const STORAGE_KEY = 'drawer-data'
const CACHE_DURATION = 1000 * 60 * 60 // 1 giờ

export const useDrawerStore = defineStore('drawer', () => {
  // state

  const links = ref([])
  const buttons = ref([])
  const loading = ref(false)
  const error = ref(null)
  const leftDrawerOpen = ref(false)
  const language = ref((process.env.CLIENT ? localStorage.getItem('app-language') : null) || 'vi-VN')

  const languageOptions = ref([
    { label: 'English', value: 'en-US' },
    { label: 'Tiếng Việt', value: 'vi-VN' }
  ])

  // localStorage helpers
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

        // Kiểm tra xem cache đã hết hạn chưa
        if (isCacheExpired(data.timestamp)) {
          // Cache hết hạn, xóa đi
          localStorage.removeItem(getStorageKey())
          return false
        }

        // Kiểm tra xem data có hợp lệ không
        if (data.links && data.buttons) {
          links.value = data.links
          buttons.value = data.buttons
          return true
        }
      }
    } catch (err) {
      console.error('Failed to load drawer data from localStorage:', err)
      // Nếu có lỗi, xóa cache bị lỗi
      try {
        localStorage.removeItem(getStorageKey())
      } catch (cleanupErr) {
        // Ignore cleanup errors
        console.debug('Failed to remove corrupted cache:', cleanupErr)
      }
    }
    return false
  }

  function saveToLocalStorage() {
    if (!process.env.CLIENT) return

    try {
      const data = {
        links: links.value,
        buttons: buttons.value,
        timestamp: Date.now()
      }
      localStorage.setItem(getStorageKey(), JSON.stringify(data))
    } catch (err) {
      console.error('Failed to save drawer data to localStorage:', err)
    }
  }

  function clearLocalStorage() {
    if (!process.env.CLIENT) return

    try {
      // Clear all language versions
      localStorage.removeItem(`${STORAGE_KEY}-vi-VN`)
      localStorage.removeItem(`${STORAGE_KEY}-en-US`)
    } catch (err) {
      console.error('Failed to clear drawer data from localStorage:', err)
    }
  }

  // actions

  async function fetchDrawerData(forceRefresh = false) {
    // Nếu không force refresh, thử load từ localStorage trước
    if (!forceRefresh && loadFromLocalStorage()) {
      return
    }

    loading.value = true
    error.value = null
    try {
      const res = await axios.get(`${API_BASE_URL}/drawer${getLangQuery()}`)
      links.value = res.data.links
      buttons.value = res.data.buttons

      // Lưu vào localStorage sau khi fetch thành công
      saveToLocalStorage()
    } catch (err) {
      error.value = err.message || 'Failed to fetch drawer data'
      // Nếu lỗi, thử load từ localStorage như fallback
      loadFromLocalStorage()
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

  async function setLanguage(newLanguage) {
    const oldLanguage = language.value
    language.value = newLanguage

    if (process.env.CLIENT) {
      localStorage.setItem('app-language', newLanguage)
    }

    // Nếu đổi ngôn ngữ, reload drawer data
    if (oldLanguage !== newLanguage) {
      await fetchDrawerData()
    }
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
    clearLocalStorage,
    loadFromLocalStorage,
    saveToLocalStorage,

    // getters
    linkCount,
    firstLink,
    buttonCount,
    firstButton
  }
})
