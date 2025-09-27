export function getLangQuery() {
  const currentLang = localStorage.getItem('app-language') || 'vi-VN'
  return currentLang === 'vi-VN' ? '?lang=vi' : ''
}

export function getCurrentLang() {
  return localStorage.getItem('app-language') || 'vi-VN'
}