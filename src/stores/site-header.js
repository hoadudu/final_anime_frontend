import { defineStore } from 'pinia'
import axios from 'axios'

export const useLogoStore = defineStore('logo', {
  state: () => ({
    logos: [],   // state: danh sách logo
    loading: false,
    error: null
  }),
  actions: {
    async fetchLogos() {
      this.loading = true
      this.error = null
      try {
        const res = await axios.get('https://fakestoreapi.com/products')
        this.logos = res.data
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    }
  },
  getters: {
    logoCount: (state) => state.logos.length,
    firstLogo: (state) => state.logos[0] || null
  }
})
