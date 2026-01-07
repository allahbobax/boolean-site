// API для работы с backend
import { fetch } from '@tauri-apps/plugin-http'

const API_URL = 'https://api.booleanclient.ru'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

// Получить информацию о пользователе
export async function getUserInfo(userId: number) {
  try {
    const url = `${API_URL}/api/users?id=${userId}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 секунд таймаут

    const response = await fetch(url, {
      method: 'GET',
      headers: {
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
    const response = await fetch(`${API_URL}/api/health`)
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
    const response = await fetch(`${API_URL}/api/users?id=${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })
    return await response.json()
  } catch (error) {
    return { success: false, message: 'Ошибка подключения к серверу' }
  }
}

// Получить всех пользователей (для админки)
export async function getAllUsers() {
  try {
    const response = await fetch(`${API_URL}/api/users`)
    return await response.json()
  } catch (error) {
    return { success: false, message: 'Ошибка подключения к серверу' }
  }
}

// Изменение подписки пользователя
export async function changeUserSubscription(userId: number, subscription: 'free' | 'premium' | 'alpha') {
  try {
    const response = await fetch(`${API_URL}/api/users?id=${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
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
    const response = await fetch(`${API_URL}/api/users?id=${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return await response.json()
  } catch (error) {
    return { success: false, message: 'Ошибка подключения к серверу' }
  }
}

// Получить новости
export async function getNews() {
  try {
    const url = `${API_URL}/api/news`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 секунд таймаут

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
