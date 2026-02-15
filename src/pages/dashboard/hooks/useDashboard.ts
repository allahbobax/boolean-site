import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, setCurrentUser } from '../../../utils/database'
import { updateUser } from '../../../utils/api'
import { activateLicenseKey } from '../../../utils/keys'
import { User, UserProfile } from '../../../types'
import { useTranslation } from '../../../hooks/useTranslation'
import { useNotifications } from '../../../hooks/useNotifications'
import { userSync } from '../../../utils/userSync'
import { compressImage, needsCompression } from '../../../utils/imageCompressor'

export type TabType = 'launcher' | 'profile' | 'subscription' | 'friends'

export function useDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const { notifications, addNotification, removeNotification } = useNotifications()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showSoonModal, setShowSoonModal] = useState(false)
  const [keyInput, setKeyInput] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('launcher')
  const [profileForm, setProfileForm] = useState<UserProfile>({})
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { t, dateLocale } = useTranslation()

  useEffect(() => {
    const userData = getCurrentUser()
    if (!userData) {
      navigate('/auth')
    } else {
      setUser(userData)
      setProfileForm(userData.profile || {})

      // Инициализируем real-time синхронизацию
      userSync.init(Number(userData.id))

      // Подписываемся на обновления (включая аватарку из лаунчера)
      const unsubscribe = userSync.subscribe((updatedUser) => {
        setUser(updatedUser)
        setProfileForm(updatedUser.profile || {})
      })

      return () => {
        unsubscribe()
        userSync.destroy()
      }
    }
  }, [navigate])

  const handleLogout = () => {
    setCurrentUser(null)
    navigate('/auth')
  }

  const handleBuyClient = () => {
    navigate('/pricing')
  }

  const handleActivateKey = async () => {
    if (!keyInput.trim()) {
      addNotification(t.dashboard.enterKeyToActivate, 'error')
      return
    }

    if (!user) {
      addNotification('Пользователь не найден', 'error')
      return
    }

    try {
      const result = await activateLicenseKey(keyInput.trim().toUpperCase(), String(user.id))

      if (result.success) {
        // Обновление подписки пользователя
        const updatedUser = {
          ...user,
          subscription: result.data.newSubscription,
          subscriptionEndDate: result.data.subscriptionEndDate ?? user.subscriptionEndDate
        }
        updateUserData(updatedUser)

        const productNames: Record<string, string> = {
          'premium': 'Premium',
          'alpha': 'Alpha',
          'inside-client': 'Shakedown Client',
          'inside-spoofer': 'Shakedown Spoofer',
          'inside-cleaner': 'Shakedown Cleaner'
        }

        const durationText = result.data.duration === 0
          ? t.dashboard.forever
          : t.dashboard.forDays.replace('{days}', String(result.data.duration))

        addNotification(`${t.dashboard.keyActivated} ${productNames[result.data.product]} ${durationText}`, 'success')
        setKeyInput('')
      } else {
        addNotification(result.message || 'Ошибка активации ключа', 'error')
      }
    } catch (error) {
      addNotification('Ошибка сети при активации ключа', 'error')
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 15 * 1024 * 1024) {
      addNotification(t.dashboard.fileTooLarge, 'error')
      return
    }

    try {
      let base64: string

      // Сжимаем изображение если нужно (оптимизация загрузки)
      if (needsCompression(file, 200)) {
        base64 = await compressImage(file, {
          maxWidth: 512,
          maxHeight: 512,
          quality: 0.85,
          maxSizeKB: 200
        })
      } else {
        base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (event) => resolve(event.target?.result as string)
          reader.onerror = () => reject(new Error('Failed to read file'))
          reader.readAsDataURL(file)
        })
      }

      if (user) {
        const updatedUser = { ...user, avatar: base64 }
        updateUserData(updatedUser)
        addNotification(t.dashboard.avatarUpdated, 'success')
      }
    } catch (error) {
      addNotification('Ошибка при загрузке аватара', 'error')
    }
  }

  const handleProfileSave = () => {
    if (!user) return

    // БЕЗОПАСНОСТЬ: Проверка уникальности имени теперь должна выполняться на сервере
    // Клиентская проверка убрана, так как localStorage больше не содержит список пользователей
    if (profileForm.displayName && !profileForm.displayName.trim()) {
      addNotification(t.dashboard.nameTaken, 'error')
      return
    }

    const updatedUser = { ...user, profile: { displayName: profileForm.displayName } }
    updateUserData(updatedUser)
    addNotification(t.dashboard.profileSaved, 'success')
  }

  const updateUserData = (updatedUser: User) => {
    setCurrentUser(updatedUser)
    setUser(updatedUser)

    // Уведомляем о локальном обновлении для синхронизации между вкладками
    userSync.notifyLocalUpdate(updatedUser)

      // БЕЗОПАСНОСТЬ: Не сохраняем массив пользователей в localStorage
      // Данные должны храниться только на сервере

      ; (async () => {
        try {
          const response = await updateUser(updatedUser.id, {
            avatar: updatedUser.avatar,
            subscription: updatedUser.subscription,
            settings: updatedUser.settings,
          })

          if (response?.success && response.data) {
            const mergedUser: User = {
              ...updatedUser,
              ...response.data,
              registeredAt: response.data.registeredAt || updatedUser.registeredAt,
              settings: response.data.settings || updatedUser.settings,
            }
            setCurrentUser(mergedUser)
            setUser(mergedUser)
            userSync.notifyLocalUpdate(mergedUser)
          }
        } catch (error) {
          // Failed to persist user to API
        }
      })()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(dateLocale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getSubscriptionBadge = (subscription: string) => {
    switch (subscription) {
      case 'alpha': return { text: 'Alpha', class: 'badge-alpha' }
      case 'premium': return { text: 'Premium', class: 'badge-premium' }
      default: return { text: 'Free', class: 'badge-free' }
    }
  }

  return {
    user,
    notifications,
    addNotification,
    removeNotification,
    showLogoutModal,
    setShowLogoutModal,
    showSoonModal,
    setShowSoonModal,
    keyInput,
    setKeyInput,
    activeTab,
    setActiveTab,
    profileForm,
    setProfileForm,
    mobileMenuOpen,
    setMobileMenuOpen,
    avatarInputRef,
    navigate,
    t,
    handleLogout,
    handleBuyClient,
    handleActivateKey,
    handleAvatarChange,
    handleProfileSave,
    formatDate,
    getSubscriptionBadge
  }
}
