// Централизованная конфигурация API
export const API_URL = 'https://api.booleanclient.ru'

// API ключ для защищённых роутов
const API_KEY = import.meta.env.VITE_INTERNAL_API_KEY || '2dde155f9757ddd4c6d85f89e65d62b24987b6116aaf156d91afaa466bb1221ec2433710a74efbe91e81043a32d432285d818a1c5d33091d2d9ee6f17d0f6ee3b2db15d244f64a25816c04c2b27caca5c692bf54b9b9a965ba9a2a77ba3cc2ad0e69ffe83f2e56141012bb6aaf4f873ed55a3dc12229ed7fb0333210ef65dc0d'

// Базовые заголовки для всех запросов
export function getHeaders(includeApiKey = false): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  if (includeApiKey && API_KEY) {
    headers['X-API-Key'] = API_KEY
  }
  
  return headers
}

// Заголовки для защищённых роутов (users, keys, versions, hwid, products)
export function getProtectedHeaders(): HeadersInit {
  return getHeaders(true)
}

// Заголовки для публичных роутов (auth, health, status, incidents)
export function getPublicHeaders(): HeadersInit {
  return getHeaders(false)
}
