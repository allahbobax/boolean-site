// API for backend interaction
import { API_URL, getPublicHeaders, getProtectedHeaders } from './apiConfig'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

async function parseJsonResponse(response: Response) {
  const contentType = response.headers.get('content-type') || ''
  const text = await response.text()

  if (!response.ok) {
    return {
      success: false,
      message: `HTTP ${response.status}`,
      data: undefined,
      raw: text,
      contentType,
    }
  }

  try {
    return text ? JSON.parse(text) : { success: true }
  } catch {
    return {
      success: false,
      message: 'Invalid JSON response from server',
      raw: text,
      contentType,
    }
  }
}

// Update user
export async function updateUser(userId: number | string, updates: any) {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: getProtectedHeaders(),
      body: JSON.stringify(updates),
    })
    return await parseJsonResponse(response)
  } catch (error) {
    return { success: false, message: 'Server connection error' }
  }
}

// Login
export async function login(emailOrUsername: string, password: string) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getPublicHeaders(),
      body: JSON.stringify({ login: emailOrUsername, password }),
    })
    return await parseJsonResponse(response)
  } catch (error) {
    return { success: false, message: 'Server connection error' }
  }
}

// Register
export async function register(username: string, email: string, password: string) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: getPublicHeaders(),
      body: JSON.stringify({ username, email, password }),
    })
    return await parseJsonResponse(response)
  } catch (error) {
    return { success: false, message: 'Server connection error' }
  }
}

// Admin login
export async function adminLogin(adminKey: string, password: string, turnstileToken?: string | null) {
  try {
    const response = await fetch(`${API_URL}/auth/admin-login`, {
      method: 'POST',
      headers: getPublicHeaders(),
      body: JSON.stringify({ adminKey, password, turnstileToken }),
    })
    return await parseJsonResponse(response)
  } catch (error) {
    return { success: false, message: 'Server connection error' }
  }
}

// Get user info
export async function getUserInfo(userId: number | string) {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      headers: getProtectedHeaders(),
    })
    return await parseJsonResponse(response)
  } catch (error) {
    return { success: false, message: 'Server connection error' }
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

// Получить всех пользователей (для админки)
export async function getAllUsers() {
  try {
    const response = await fetch(`${API_URL}/users`, {
      headers: getProtectedHeaders(),
    })
    return await parseJsonResponse(response)
  } catch (error) {
    return { success: false, message: 'Ошибка подключения к серверу' }
  }
}

// Подтверждение email по коду
export async function verifyEmailCode(userId: number | string, code: string) {
  try {
    const response = await fetch(`${API_URL}/auth/verify-code`, {
      method: 'POST',
      headers: getPublicHeaders(),
      body: JSON.stringify({ userId, code }),
    })
    return await parseJsonResponse(response)
  } catch (error) {
    return { success: false, message: 'Ошибка подключения к серверу' }
  }
}

// Повторная отправка кода
export async function resendVerificationCode(userId: number | string) {
  try {
    const response = await fetch(`${API_URL}/auth/resend-code`, {
      method: 'POST',
      headers: getPublicHeaders(),
      body: JSON.stringify({ userId }),
    })
    return await parseJsonResponse(response)
  } catch (error) {
    return { success: false, message: 'Ошибка подключения к серверу' }
  }
}
