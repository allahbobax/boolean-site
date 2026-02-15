/**
 * Утилита для real-time синхронизации данных пользователя
 * Использует localStorage events для синхронизации между вкладками
 * и polling для получения обновлений с сервера
 */

import { User } from '../types'
import { getUserInfo } from './api'
import { getCurrentUser, setCurrentUser } from './database'

type UserUpdateCallback = (user: User) => void

class UserSyncManager {
  private listeners: Set<UserUpdateCallback> = new Set()
  private pollingInterval: number | null = null
  private lastAvatarHash: string = ''
  private userId: number | null = null
  
  /**
   * Инициализирует синхронизацию для пользователя
   */
  init(userId: number) {
    // Если уже инициализирован, не запускаем повторно
    if (this.userId === userId && this.pollingInterval !== null) {
      return
    }
    
    // Очищаем старый polling если был
    this.stopPolling()
    
    this.userId = userId
    this.setupStorageListener()
    this.startPolling()
    
    // Сохраняем текущий хэш аватарки
    const user = getCurrentUser()
    if (user?.avatar) {
      this.lastAvatarHash = this.hashString(user.avatar)
    }
  }
  
  /**
   * Останавливает синхронизацию
   */
  destroy() {
    this.stopPolling()
    window.removeEventListener('storage', this.handleStorageChange)
    this.listeners.clear()
    this.userId = null
  }
  
  /**
   * Подписывается на обновления пользователя
   */
  subscribe(callback: UserUpdateCallback): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }
  
  /**
   * Принудительно обновляет данные с сервера
   */
  async forceRefresh(): Promise<User | null> {
    if (!this.userId) return null
    
    try {
      const response = await getUserInfo(this.userId)
      if (response?.success && response.data) {
        const currentUser = getCurrentUser()
        const mergedUser: User = {
          ...currentUser,
          ...response.data,
          registeredAt: response.data.registeredAt || currentUser?.registeredAt,
          settings: response.data.settings || currentUser?.settings,
        }
        
        this.updateUser(mergedUser)
        return mergedUser
      }
    } catch (e) {
      console.error('[UserSync] Force refresh failed:', e)
    }
    return null
  }
  
  /**
   * Уведомляет о локальном обновлении (для синхронизации между вкладками)
   */
  notifyLocalUpdate(user: User) {
    // Триггерим storage event для других вкладок
    const timestamp = Date.now()
    localStorage.setItem('user_update_trigger', String(timestamp))
    
    // Обновляем хэш аватарки
    if (user.avatar) {
      this.lastAvatarHash = this.hashString(user.avatar)
    }
  }
  
  private setupStorageListener() {
    // Удаляем старый обработчик если был
    window.removeEventListener('storage', this.handleStorageChange)
    window.addEventListener('storage', this.handleStorageChange)
  }
  
  private handleStorageChange = (e: StorageEvent) => {
    // Реагируем на изменения в currentUser или триггер обновления
    if (e.key === 'currentUser' || e.key === 'user_update_trigger') {
      const user = getCurrentUser()
      if (user) {
        this.notifyListeners(user)
      }
    }
  }
  
  private startPolling() {
    // Polling каждые 5 секунд для проверки обновлений аватарки
    this.pollingInterval = window.setInterval(async () => {
      await this.checkForUpdates()
    }, 5000)
  }
  
  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
  }
  
  private async checkForUpdates() {
    if (!this.userId) return
    
    try {
      const response = await getUserInfo(this.userId)
      if (response?.success && response.data) {
        const serverUser = response.data
        const currentUser = getCurrentUser()
        
        // Проверяем изменилась ли аватарка
        const serverAvatarHash = serverUser.avatar ? this.hashString(serverUser.avatar) : ''
        
        if (serverAvatarHash !== this.lastAvatarHash) {
          console.log('[UserSync] Avatar changed on server, updating...')
          this.lastAvatarHash = serverAvatarHash
          
          const mergedUser: User = {
            ...currentUser,
            ...serverUser,
            registeredAt: serverUser.registeredAt || currentUser?.registeredAt,
            settings: serverUser.settings || currentUser?.settings,
          }
          
          this.updateUser(mergedUser)
        }
      }
    } catch (e) {
      // Polling failed silently
    }
  }
  
  private updateUser(user: User) {
    setCurrentUser(user)
    this.notifyListeners(user)
  }
  
  private notifyListeners(user: User) {
    this.listeners.forEach(callback => {
      try {
        callback(user)
      } catch (e) {
        console.error('[UserSync] Listener error:', e)
      }
    })
  }
  
  /**
   * Простой хэш строки для сравнения
   */
  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < Math.min(str.length, 1000); i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString(36)
  }
}

// Singleton instance
export const userSync = new UserSyncManager()
