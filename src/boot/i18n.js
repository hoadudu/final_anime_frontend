import { defineBoot } from '#q-app/wrappers'
import { createI18n } from 'vue-i18n'
import messages from 'src/i18n'

// Lấy ngôn ngữ từ localStorage hoặc dùng en-US làm mặc định
const savedLanguage = localStorage.getItem('app-language') || 'en-US'

// Tạo i18n instance
const i18n = createI18n({
  locale: savedLanguage,
  legacy: false, // Bật chế độ Composition API
  globalInjection: true,
  messages,
})

export default defineBoot(({ app }) => {
  // Set i18n instance on app
  app.use(i18n)
})

// Export i18n instance để có thể import từ các file khác
export { i18n }
