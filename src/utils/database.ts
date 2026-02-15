import { User } from '../types'
import * as api from './api'

export class Database {
  constructor() {
    // Очищаем старые небезопасные данные если они есть
    if (localStorage.getItem('insideUsers')) {
      console.warn('Removing insecure user data from localStorage')
      localStorage.removeItem('insideUsers')
    }
  }

  save() {
    console.warn('Database.save() called but localStorage storage is disabled for security')
  }

  async login(emailOrUsername: string, password: string) {
    const result = await api.login(emailOrUsername, password)
    return {
      success: result.success,
      user: result.data,
      message: result.message,
      requiresVerification: result.requiresVerification,
      userId: result.userId
    }
  }

  async register(username: string, email: string, password: string) {
    const result = await api.register(username, email, password)
    return {
      success: result.success,
      user: result.data,
      message: result.message,
      requiresVerification: result.requiresVerification
    }
  }

  async adminLogin(adminKey: string, password: string, turnstileToken?: string | null) {
    const result = await api.adminLogin(adminKey, password, turnstileToken)
    return {
      success: result.success,
      user: result.data,
      message: result.message
    }
  }

  async updateUser(userId: number, updates: Partial<User>) {
    const result = await api.updateUser(userId, updates)
    if (result.success && result.data) {
      return { success: true, user: result.data }
    }
    return { success: false, message: 'Ошибка обновления пользователя' }
  }

  async getUserById(userId: number | string) {
    const result = await api.getUserInfo(userId)
    if (result.success && result.data) {
      return { success: true, user: result.data }
    }
    return { success: false, message: 'Пользователь не найден' }
  }
}

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('currentUser')
  if (!userStr) return null
  
  const user = JSON.parse(userStr)
  // Если по какой-то причине пароль попал в localStorage, удаляем его
  if (user.password) {
    delete user.password
    setCurrentUser(user)
  }
  return user
}

export const setCurrentUser = (user: User | null) => {
  if (user) {
    // Создаем копию пользователя БЕЗ пароля
    const { password, ...safeUser } = user
    localStorage.setItem('currentUser', JSON.stringify(safeUser))
  } else {
    localStorage.removeItem('currentUser')
  }

  window.dispatchEvent(new Event('currentUserChanged'))
}
