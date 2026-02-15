// API для работы с backend
import { fetch } from '@tauri-apps/plugin-http'

const API_URL = 'https://api.booleanclient.online'
const API_KEY = '2dde155f9757ddd4c6d85f89e65d62b24987b6116aaf156d91afaa466bb1221ec2433710a74efbe91e81043a32d432285d818a1c5d33091d2d9ee6f17d0f6ee3b2db15d244f64a25816c04c2b27caca5c692bf54b9b9a965ba9a2a77ba3cc2ad0e69ffe83f2e56141012bb6aaf4f873ed55a3dc12229ed7fb0333210ef65dc0d'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

// Заголовки для защищённых роутов
function getProtectedHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY
    console.log('[getProtectedHeaders] API_KEY length:', API_KEY.length)
  } else {
    console.warn('[getProtectedHeaders] API_KEY is empty!')
  }
  return headers
}

// Получить информацию о пользователе
export async function getUserInfo(userId: number) {
  try {
    const url = `${API_URL}/users/${userId}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...getProtectedHeaders(),
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      cache: 'no-cache',
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    const data = await response.json()
    return data
  } catch (error) {
    return { success: false, message: 'Ошибка подключения к серверу' }
  }
}

// Проверка доступности сервера
export async function checkServerHealth() {
  try {
    const response = await fetch(`${API_URL}/health`)
    return response.ok
  } catch (error) {
    return false
  }
}

// Загрузка пользовательской аватарки
export async function uploadAvatar(userId: number, avatarBase64: string) {
  try {
    return await updateUser(userId, { avatar: avatarBase64 })
  } catch (error) {
    return { success: false, message: 'Ошибка подключения к серверу' }
  }
}

// Удаление пользовательской аватарки
export async function deleteAvatar(userId: number) {
  try {
    return await updateUser(userId, { avatar: null })
  } catch (error) {
    return { success: false, message: 'Ошибка подключения к серверу' }
  }
}

// Обновление пользователя
export async function updateUser(userId: number, updates: any) {
  try {
    const headers = getProtectedHeaders()
    console.log('[updateUser] Sending request with headers:', Object.keys(headers))
    console.log('[updateUser] X-API-Key present:', !!headers['X-API-Key'])
    
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: headers,
      body: JSON.stringify(updates),
    })
    
    console.log('[updateUser] Response status:', response.status)
    const data = await response.json()
    console.log('[updateUser] Response data:', data)
    
    return data
  } catch (error) {
    console.error('[updateUser] Error:', error)
    return { success: false, message: 'Ошибка подключения к серверу' }
  }
}

// Получить всех пользователей (для админки)
export async function getAllUsers() {
  try {
    const response = await fetch(`${API_URL}/users`, {
      headers: getProtectedHeaders(),
    })
    return await response.json()
  } catch (error) {
    return { success: false, message: 'Ошибка подключения к серверу' }
  }
}

// Изменение подписки пользователя
export async function changeUserSubscription(userId: number, subscription: 'free' | 'premium' | 'alpha') {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: getProtectedHeaders(),
      body: JSON.stringify({ subscription }),
    })
    return await response.json()
  } catch (error) {
    return { success: false, message: 'Ошибка подключения к серверу' }
  }
}

// Удаление пользователя
export async function deleteUser(userId: number) {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: getProtectedHeaders(),
    })
    return await response.json()
  } catch (error) {
    return { success: false, message: 'Ошибка подключения к серверу' }
  }
}

// Получить новости
export async function getNews() {
  try {
    const url = `${API_URL}/news`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      cache: 'no-cache',
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Ошибка подключения к серверу'
    }
  }
}
