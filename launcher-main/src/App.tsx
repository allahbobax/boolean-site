import { useState, useEffect } from 'react'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import AuthPage from './pages/AuthPage'
import UpdateNotification from './components/UpdateNotification'
import { LanguageProvider } from './contexts/LanguageContext'
import type { User } from './types'
import { getUserInfo } from './utils/api'
import Snowfall from './components/Snowfall'
import './styles/App.css'


export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'profile' | 'settings'>('home')
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Проверяем сохраненного пользователя и обновляем его данные с сервера
    const loadUser = async () => {
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser)
          setUser(parsedUser)
          setIsLoading(false) // Сразу показываем UI с кешированными данными

          // Загружаем актуальные данные с сервера (включая аватарку) в фоне
          try {
            const response = await Promise.race([
              getUserInfo(parsedUser.id),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            ]) as any

            if (response.success && response.data) {
              const updatedUser = {
                ...parsedUser,
                ...response.data,
                registeredAt: response.data.registeredAt || parsedUser.registeredAt
              }

              setUser(updatedUser)
              localStorage.setItem('user', JSON.stringify(updatedUser))
            }
          } catch (e) {
            // Failed to update from server, continue with cached data
          }
        } catch (e) {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }

    loadUser()

    // Переменные для управления частотой обновлений
    let lastUpdateTime = 0
    let isUpdating = false
    let lastUserData = ''

    // Функция для обновления данных пользователя
    const updateUserData = async () => {
      const now = Date.now()
      const savedUser = localStorage.getItem('user')
      
      // Проверяем, что с момента последнего обновления прошла хотя бы 1 секунда
      // и нет активного запроса на обновление
      if (!savedUser || isUpdating || (now - lastUpdateTime < 1000)) {
        return
      }

      try {
        isUpdating = true
        lastUpdateTime = now
        
        const parsedUser = JSON.parse(savedUser)
        const response = await getUserInfo(parsedUser.id)
        
        if (response.success && response.data) {
          const updatedUser = {
            ...parsedUser,
            ...response.data,
            registeredAt: response.data.registeredAt || parsedUser.registeredAt
          }

          // Обновляем только если данные изменились
          const userDataStr = JSON.stringify(updatedUser)
          if (userDataStr !== lastUserData) {
            lastUserData = userDataStr

            setUser(updatedUser)
            localStorage.setItem('user', userDataStr)
          }
        }
      } catch (e) {
        // Auto-update failed
      } finally {
        isUpdating = false
      }
    }

    // Запускаем обновление каждую секунду
    const intervalId = setInterval(updateUserData, 1000)
    
    // Первое обновление
    updateUserData()

    return () => clearInterval(intervalId)
  }, [])

  const handleLogin = (userData: User) => {
    // Сохраняем токен отдельно
    if ('token' in userData) {
      localStorage.setItem('token', (userData as any).token)
    }
    // Сохраняем пользователя без токена
    const userWithoutToken = { ...userData }
    delete (userWithoutToken as any).token
    setUser(userWithoutToken)
    localStorage.setItem('user', JSON.stringify(userWithoutToken))
  }

  const handleUserUpdate = (userData: User) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  if (isLoading) {
    return (
      <LanguageProvider>
        <div className="app loading">
          <div className="loader"></div>
        </div>
      </LanguageProvider>
    )
  }

  if (!user) {
    return (
      <LanguageProvider>
        <Snowfall />
        <AuthPage onLogin={handleLogin} />
      </LanguageProvider>
    )
  }

  return (
    <LanguageProvider>
      <Snowfall />
      <div className="app">
        <TitleBar />
        <UpdateNotification />
        <div className="app-main">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} user={user} onLogout={handleLogout} />
          <div className="app-content">
            {activeTab === 'home' && <HomePage user={user} />}
            {activeTab === 'profile' && <ProfilePage user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />}
            {activeTab === 'settings' && <SettingsPage />}
          </div>
        </div>
      </div>
    </LanguageProvider>
  )
}

