export function getLangQuery() {
  const currentLang = (process.env.CLIENT ? localStorage.getItem('app-language') : null) || 'vi-VN'
  return currentLang === 'vi-VN' ? '?lang=vi' : ''
}

export function getCurrentLang() {
  return (process.env.CLIENT ? localStorage.getItem('app-language') : null) || 'vi-VN'
}