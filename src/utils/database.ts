import { User } from '../types'
import * as api from './api'

export class Database {
  private users: User[]

  constructor() {
    this.users = []
    
    // Очищаем старые небезопасные данные если они есть
    if (localStorage.getItem('insideUsers')) {
      console.warn('Removing insecure user data from localStorage')
      localStorage.removeItem('insideUsers')
    }
  }

  save() {
    console.warn('Database.save() called but localStorage storage is disabled for security')
  }

  async register(username: string, email: string, password: string, turnstileToken?: string) {
    // ОПТИМИЗАЦИЯ: Сразу пробуем API, не ждём health check
    // Если API недоступен - узнаем по ошибке запроса
    const result = await api.registerUser(username, email, password, turnstileToken)
    
    if (result.success && result.data) {
      return {
        success: true,
        message: result.message || 'Регистрация успешна!',
        user: result.data,
        requiresVerification: (result as any).requiresVerification || false,
      }
    }

    // Проверяем, это ошибка сети или бизнес-ошибка
    if (result.message === 'Ошибка подключения к серверу') {
      return { 
        success: false, 
        message: 'Сервер недоступен. Регистрация временно невозможна.' 
      }
    }

    return { success: false, message: result.message || 'Ошибка регистрации' }
  }

  async login(usernameOrEmail: string, password: string, turnstileToken?: string) {
    // ОПТИМИЗАЦИЯ: Сразу пробуем API, не ждём health check
    const result = await api.loginUser(usernameOrEmail, password, turnstileToken)
    
    if ((result as any).requiresVerification && (result as any).userId) {
      return {
        success: false,
        message: result.message || 'Подтвердите email кодом из письма',
        requiresVerification: true,
        userId: String((result as any).userId),
      }
    }

    if (result.success && result.data) {
      return { success: true, message: result.message || 'Вход выполнен!', user: result.data }
    }

    // Проверяем, это ошибка сети или бизнес-ошибка
    if (result.message === 'Ошибка подключения к серверу') {
      return { 
        success: false, 
        message: 'Сервер недоступен. Вход временно невозможен.' 
      }
    }

    return { success: false, message: result.message || 'Неверный логин или пароль' }
  }

  async updateUser(userId: number, updates: Partial<User>) {
    const result = await api.updateUser(userId, updates)
    if (result.success && result.data) {
      return { success: true, user: result.data }
    }

    // Fallback на localStorage
    const userIndex = this.users.findIndex(u => u.id === userId)
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updates }
      this.save()
      return { success: true, user: this.users[userIndex] }
    }
    return { success: false, message: 'Пользователь не найден' }
  }

  async getUserById(userId: number | string) {
    const result = await api.getUserInfo(userId)
    if (result.success && result.data) {
      return { success: true, user: result.data }
    }

    // Fallback на localStorage
    const user = this.users.find(u => u.id === userId)
    if (user) {
      return { success: true, user }
    }
    return { success: false, message: 'Пользователь не найден' }
  }

  async adminLogin(adminKey: string, password: string, turnstileToken?: string) {
    try {
      const result = await api.loginUser(adminKey, password, turnstileToken);
      if (result.success && result.data?.isAdmin) {
        return { 
          success: true, 
          message: 'Добро пожаловать, администратор!', 
          user: result.data 
        };
      }
      // Если логин успешен, но не админ
      if (result.success && !result.data?.isAdmin) {
        return { 
          success: false, 
          message: 'У вас нет прав администратора' 
        };
      }
      // Возвращаем ошибку от API (включая ошибку Turnstile)
      return { 
        success: false, 
        message: result.message || 'Неверные данные администратора' 
      };
    } catch (error) {
      return { success: false, message: 'Ошибка входа администратора' };
    }
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
