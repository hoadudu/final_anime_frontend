export function getLangQuery() {
  const currentLang = localStorage.getItem('app-language') || 'en-US'
  return currentLang === 'vi-VN' ? '?lang=vi' : ''
}

export function getCurrentLang() {
  return localStorage.getItem('app-language') || 'en-US'
}