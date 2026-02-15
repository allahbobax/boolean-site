// Централизованная конфигурация API
export const API_URL = 'https://api.booleanclient.online'

// API ключ для защищённых роутов (ОБЯЗАТЕЛЬНО установите в .env)
const API_KEY = import.meta.env.VITE_INTERNAL_API_KEY

if (!API_KEY) {
  console.error('⚠️ VITE_INTERNAL_API_KEY not set! Protected API routes will fail.')
}

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
