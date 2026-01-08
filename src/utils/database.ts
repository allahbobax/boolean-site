import { User } from '../types'
import * as api from './api'

export class Database {
  private users: User[]
  private useApi: boolean = false
  private apiReady: Promise<void>

  constructor() {
    // БЕЗОПАСНОСТЬ: Не загружаем пользователей из localStorage
    // Все данные должны храниться только на сервере
    this.users = []
    
    // Очищаем старые небезопасные данные если они есть
    if (localStorage.getItem('insideUsers')) {
      console.warn('Removing insecure user data from localStorage')
      localStorage.removeItem('insideUsers')
    }
    
    // Проверяем доступность API при инициализации и сохраняем promise
    this.apiReady = this.checkApiAvailability()
  }

  private async checkApiAvailability() {
    this.useApi = await api.checkServerHealth()
  }

  save() {
    // БЕЗОПАСНОСТЬ: Не сохраняем пользователей в localStorage
    // Все данные должны храниться только на сервере
    console.warn('Database.save() called but localStorage storage is disabled for security')
  }

  private async ensureApiReady() {
    try {
      await this.apiReady
    } catch (error) {
      this.useApi = false
    }
  }

  async register(username: string, email: string, password: string, turnstileToken?: string) {
    await this.ensureApiReady()
    // Пробуем использовать API
    if (this.useApi) {
      const result = await api.registerUser(username, email, password, turnstileToken)
      if (result.success && result.data) {
        return {
          success: true,
          message: result.message || 'Регистрация успешна!',
          user: result.data,
          requiresVerification: (result as any).requiresVerification || false,
        }
      }

      return { success: false, message: result.message || 'Ошибка регистрации' }
    }

    // БЕЗОПАСНОСТЬ: Fallback на localStorage УДАЛЕН
    // Регистрация возможна только через API сервер
    return { 
      success: false, 
      message: 'Сервер недоступен. Регистрация временно невозможна.' 
    }
  }

  async login(usernameOrEmail: string, password: string, turnstileToken?: string) {
    await this.ensureApiReady()
    
    // Пробуем использовать API
    if (this.useApi) {
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

      return { success: false, message: result.message || 'Неверный логин или пароль' }
    }

    // БЕЗОПАСНОСТЬ: Fallback на localStorage УДАЛЕН
    // Вход возможен только через API сервер
    return { 
      success: false, 
      message: 'Сервер недоступен. Вход временно невозможен.' 
    }
  }

  async updateUser(userId: number, updates: Partial<User>) {
    await this.ensureApiReady()
    // Пробуем использовать API
    if (this.useApi) {
      const result = await api.updateUser(userId, updates)
      if (result.success && result.data) {
        return { success: true, user: result.data }
      }
      // Если API не сработал, fallback на localStorage
      this.useApi = false
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
    await this.ensureApiReady()
    // Пробуем использовать API
    if (this.useApi) {
      const result = await api.getUserInfo(userId)
      if (result.success && result.data) {
        return { success: true, user: result.data }
      }
      // Если API не сработал, fallback на localStorage
      this.useApi = false
    }

    // Fallback на localStorage
    const user = this.users.find(u => u.id === userId)
    if (user) {
      return { success: true, user }
    }
    return { success: false, message: 'Пользователь не найден' }
  }

  async adminLogin(adminKey: string, password: string) {
    await this.ensureApiReady()
    try {
      // First try to use API
      if (this.useApi) {
        const result = await api.loginUser(adminKey, password);
        if (result.success && result.data?.isAdmin) {
          return { 
            success: true, 
            message: 'Добро пожаловать, администратор!', 
            user: result.data 
          };
        }
        this.useApi = false;
      }

      // БЕЗОПАСНОСТЬ: Fallback на localStorage УДАЛЕН
      // Админ-вход возможен только через API сервер
      return { 
        success: false, 
        message: 'Сервер недоступен. Вход администратора временно невозможен.' 
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
