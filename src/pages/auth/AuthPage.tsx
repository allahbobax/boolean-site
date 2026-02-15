import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../../components/Navigation.tsx'
import NotificationContainer from '../../components/NotificationContainer'
import LogoWithHat from '../../components/LogoWithHat'
import { getCurrentUser } from '../../utils/database'
import { useTranslation } from '../../hooks/useTranslation'
import { useNotifications } from '../../hooks/useNotifications'
import { LOGO_SIZES } from '../../utils/constants'
import OAuthButtons from '../../components/OAuthButtons'
import '../../styles/auth/AuthBase.css'
import '../../styles/auth/AuthForm.css'
import '../../styles/auth/AuthModal.css'
import '../../styles/auth/AuthResponsive.css'
import '../../styles/auth/OAuth.css'
import { getCurrentLanguage, Language } from '../../utils/translations/index'

export default function AuthPage() {
  const { t } = useTranslation()
  const { notifications, addNotification, removeNotification } = useNotifications()
  const [lang, setLang] = useState<Language>(getCurrentLanguage())

  const navigate = useNavigate()

  // Language handling
  useEffect(() => {
    const handleStorageChange = () => {
      setLang(getCurrentLanguage())
    }
    window.addEventListener('storage', handleStorageChange)

    const interval = setInterval(() => {
      const newLang = getCurrentLanguage()
      if (newLang !== lang) {
        setLang(newLang)
      }
    }, 100)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [lang])

  // Redirect if already authenticated
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const authStatus = urlParams.get('auth')
    const userData = urlParams.get('user')
    const error = urlParams.get('error')

    if (error) {
      addNotification(t.auth.errors[error as keyof typeof t.auth.errors] || t.auth.errors.auth_failed, 'error')
      // Clear URL params
      navigate('/auth', { replace: true })
      return
    }

    if (authStatus === 'success' && userData) {
      try {
        const decodedUser = JSON.parse(decodeURIComponent(userData))
        localStorage.setItem('user', JSON.stringify(decodedUser))
        localStorage.setItem('token', decodedUser.token)
        
        if (decodedUser.isAdmin) {
          navigate('/admin')
        } else {
          navigate('/dashboard')
        }
        return
      } catch (e) {
        addNotification('Ошибка при обработке данных пользователя', 'error')
      }
    }

    const user = getCurrentUser()
    if (user) {
      if (user.isAdmin) {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    }
  }, [navigate, addNotification, t.auth.errors])

  const handleOAuthError = (error: string) => {
    addNotification(error, 'error')
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <Navigation />
      <div className="auth-page-centered">
        {notifications.length > 0 && (
          <NotificationContainer
            notifications={notifications}
            onClose={removeNotification}
          />
        )}

        <div className="auth-box-clean">
          <div className="auth-header">
            <div className="auth-logo-small">
              <LogoWithHat size={LOGO_SIZES.auth} alt="Boolean Logo" useSvgLogo={false} />
            </div>
            <div className="auth-title-clean">
              <h2>{t.auth.welcome}</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                Выберите один из способов входа
              </p>
            </div>
          </div>

          <div className="auth-form-clean">
            <OAuthButtons onError={handleOAuthError} />
          </div>

          <div className="auth-footer-clean">
            <a href="/" className="back-link-clean">
              {t.auth.backToMain}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
