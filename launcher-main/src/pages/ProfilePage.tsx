import type { User } from '../types'
import { useLanguage } from '../contexts/LanguageContext'
import { useRef, useState } from 'react'
import { updateUser } from '../utils/api'
import { compressImage, needsCompression } from '../utils/imageCompressor'
import '../styles/ProfilePage.css'

interface ProfilePageProps {
  user: User
  onLogout: () => void
  onUserUpdate?: (user: User) => void
}

export default function ProfilePage({ user, onUserUpdate }: ProfilePageProps) {
  const { t } = useLanguage()
  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)



  const formatSubscriptionEndDate = (dateString: string) => {
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return t('profile.active')
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const subscriptionEndDate = user.subscription === 'free'
    ? t('profile.not_purchased')
    : user.subscriptionEndDate
      ? formatSubscriptionEndDate(user.subscriptionEndDate)
      : t('dashboard.forever')

  const handleOpenPersonalCabinet = () => {
    window.electron?.openExternal('https://booleanclient.online/dashboard')
  }

  const handleExtendSubscription = () => {
    window.electron?.openExternal('https://booleanclient.online/pricing')
  }


  const handleActivateKey = () => {
    window.electron?.openExternal('https://booleanclient.online/dashboard/')
  }

  const handleAvatarPick = () => {
    setAvatarError(null)
    avatarInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    console.log('[Avatar] File selected:', file.name, file.size, file.type)

    if (file.size > 15 * 1024 * 1024) {
      setAvatarError('Файл слишком большой (макс 15MB)')
      e.target.value = ''
      return
    }

    setIsUploadingAvatar(true)
    setAvatarError(null)

    try {
      let base64: string
      
      // Сжимаем изображение если нужно (оптимизация загрузки)
      if (needsCompression(file, 200)) {
        console.log('[Avatar] Compressing image...')
        base64 = await compressImage(file, {
          maxWidth: 512,
          maxHeight: 512,
          quality: 0.85,
          maxSizeKB: 200
        })
        console.log('[Avatar] Compressed size:', Math.round(base64.length / 1024), 'KB')
      } else {
        console.log('[Avatar] No compression needed, reading as-is...')
        base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result || ''))
          reader.onerror = () => reject(new Error('FileReader error'))
          reader.readAsDataURL(file)
        })
      }

      console.log('[Avatar] Base64 length:', base64.length)
      console.log('[Avatar] Calling updateUser...')
      
      const response = await updateUser(user.id, { avatar: base64 })

      console.log('[Avatar] Response:', response)

      if (!response?.success || !response.data) {
        setAvatarError(response?.message || 'Не удалось обновить аватар')
        return
      }

      const updatedUser: User = {
        ...user,
        ...response.data,
        registeredAt: response.data.registeredAt || user.registeredAt,
      }

      onUserUpdate?.(updatedUser)
    } catch (error) {
      console.error('[Avatar] Error:', error)
      setAvatarError('Ошибка при загрузке аватара')
    } finally {
      setIsUploadingAvatar(false)
      e.target.value = ''
    }
  }

  return (
    <div className="page profile-page">
      {/* Top Section - Avatar & Profile */}
      <div className="profile-top">
        {/* Avatar Section */}
        <div className="avatar-section">
          <h3 className="card-title">{t('profile.avatar')}</h3>

          <div className="avatar-container">
            <img
              src={user.avatar || '/default-avatar.jpg'}
              alt={user.username}
            />
          </div>

          <p className="avatar-text">{t('profile.upload_change_avatar')}</p>

          <button className="avatar-upload-btn" onClick={handleAvatarPick} disabled={isUploadingAvatar}>
            {isUploadingAvatar ? 'Загрузка...' : t('profile.upload')}
          </button>

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: 'none' }}
          />

          {avatarError ? <p className="avatar-text">{avatarError}</p> : null}
        </div>

        {/* Profile Info Section */}
        <div className="profile-section">
          <h3 className="card-title">{t('sidebar.profile')}</h3>

          <div className="profile-fields">
            <div className="profile-field">
              <span className="profile-field-label">{t('profile.uid')}</span>
              <span className="profile-field-colon">:</span>
              <span className="profile-field-value">{user.id}</span>
            </div>

            <div className="profile-field">
              <span className="profile-field-label">{t('profile.login')}</span>
              <span className="profile-field-colon">:</span>
              <span className="profile-field-value">{user.username}</span>
            </div>

            <div className="profile-field">
              <span className="profile-field-label">{t('profile.group')}</span>
              <span className="profile-field-colon">:</span>
              <span className="profile-field-value">
                {user.subscription === 'premium' ? t('profile.premium') :
                  user.subscription === 'alpha' ? t('profile.alpha') : t('profile.user')}
              </span>
            </div>

            <div className="profile-field">
              <span className="profile-field-label">{t('profile.client_purchased_until')}</span>
              <span className="profile-field-colon">:</span>
              <span className={`profile-field-value ${user.subscription !== 'free' ? 'subscription-active' : 'subscription-inactive'}`}>
                {subscriptionEndDate}
              </span>
            </div>

            <div className="profile-field">
              <span className="profile-field-label">HWID</span>
              <span className="profile-field-colon">:</span>
              <span className="profile-field-value">
                {user.hwid || "Не привязан"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Section */}
      <div className="actions-section">
        <h3 className="card-title">{t('profile.useful')}</h3>

        <div className="actions-grid">
          <button className="action-btn" onClick={handleOpenPersonalCabinet}>
            {t('profile.personal_cabinet')}
          </button>
          <button className="action-btn" onClick={handleExtendSubscription}>
            {t('profile.extend_subscription')}
          </button>
          <button className="action-btn full-width" onClick={handleActivateKey}>
            {t('profile.activate_key')}
          </button>
        </div>
      </div>
    </div>
  )
}
