import { User } from '../types'
import * as api from './api'

export class Database {
  private users: User[]
  private useApi: boolean = false
  private apiReady: Promise<void>

  constructor() {
    this.users = JSON.parse(localStorage.getItem('insideUsers') || '[]')
    // Проверяем доступность API при инициализации и сохраняем promise
    this.apiReady = this.checkApiAvailability()
  }

  private async checkApiAvailability() {
    this.useApi = await api.checkServerHealth()
  }

  save() {
    localStorage.setItem('insideUsers', JSON.stringify(this.users))
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

    // Fallback на localStorage
    if (this.users.find(u => u.username === username)) {
      return { success: false, message: 'Пользователь с таким логином уже существует' }
    }

    if (this.users.find(u => u.email === email)) {
      return { success: false, message: 'Email уже зарегистрирован' }
    }

    const user: User = {
      id: Date.now(),
      username,
      email,
      password: btoa(password),
      subscription: 'free',
      registeredAt: new Date().toISOString(),
      settings: {
        notifications: true,
        autoUpdate: true,
        theme: 'dark',
        language: 'ru',
        snowEnabled: true
      }
    }

    this.users.push(user)
    this.save()

    return { success: true, message: 'Регистрация успешна!', user, requiresVerification: false }
  }

  async login(usernameOrEmail: string, password: string, turnstileToken?: string) {
    await this.ensureApiReady()
    // Проверка админа
    if (usernameOrEmail === 'admin' && password === 'InsideSecurity208009') {
      const adminUser: User = {
        id: 0,
        username: 'Administrator',
        email: 'admin@shakedown.com',
        password: btoa(password),
        subscription: 'alpha',
        registeredAt: new Date().toISOString(),
        isAdmin: true,
        settings: {
          notifications: true,
          autoUpdate: true,
          theme: 'dark',
          language: 'ru',
          snowEnabled: true
        }
      }
      return { success: true, message: 'Добро пожаловать, администратор!', user: adminUser }
    }

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

    // Fallback на localStorage
    const user = this.users.find(u =>
      (u.username === usernameOrEmail || u.email === usernameOrEmail) &&
      u.password === btoa(password)
    )

    if (user) {
      // Проверка на бан
      if (user.isBanned) {
        return { success: false, message: 'Ваш аккаунт заблокирован' }
      }
      return { success: true, message: 'Вход выполнен!', user }
    }

    return { success: false, message: 'Неверный логин или пароль' }
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

      // Fallback to database check
      const encodedPassword = btoa(password);
      const user = this.users.find(u => 
        (u.username === adminKey || u.email === adminKey) && 
        u.isAdmin && 
        u.password === encodedPassword
      );

      if (user) {
        return { 
          success: true, 
          message: 'Добро пожаловать, администратор!', 
          user 
        };
      }

      return { success: false, message: 'Неверный ключ администратора или пароль' };
    } catch (error) {
      return { success: false, message: 'Ошибка входа администратора' };
    }
  }
}

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('currentUser')
  return userStr ? JSON.parse(userStr) : null
}

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user))
  } else {
    localStorage.removeItem('currentUser')
  }

  window.dispatchEvent(new Event('currentUserChanged'))
}
