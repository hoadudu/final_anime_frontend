export function getLangQuery() {
  const currentLang = (process.env.CLIENT ? localStorage.getItem('app-language') : null) || 'vi-VN'
  return currentLang === 'vi-VN' ? '?lang=vi' : ''
}

export function getCurrentLang() {
  return (process.env.CLIENT ? localStorage.getItem('app-language') : null) || 'vi-VN'
}

/**
 * Helper để build URL với query params an toàn
 * @param {string} baseUrl - URL cơ bản
 * @param {Object} params - Object chứa các query params
 * @returns {string} URL hoàn chỉnh
 */
export function buildUrlWithParams(baseUrl, params = {}) {
  const langQuery = getLangQuery()
  const searchParams = new URLSearchParams()

  // Thêm lang param nếu có
  if (langQuery) {
    const langMatch = langQuery.match(/lang=([^&]+)/)
    if (langMatch) {
      searchParams.append('lang', langMatch[1])
    }
  }

  // Thêm các params khác
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value)
    }
  })

  const queryString = searchParams.toString()
  return queryString ? `${baseUrl}?${queryString}` : baseUrl
}
