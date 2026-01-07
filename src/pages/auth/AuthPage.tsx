import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NotificationContainer from '../../components/NotificationContainer'
import { VerificationModal } from './components/VerificationModal'
import LogoWithHat from '../../components/LogoWithHat'
import { getCurrentUser, Database, setCurrentUser } from '../../utils/database'
import { useTranslation } from '../../hooks/useTranslation'
import { useNotifications } from '../../hooks/useNotifications'
import '../../styles/auth/AuthBase.css'
import '../../styles/auth/AuthForm.css'
import '../../styles/auth/AuthModal.css'
import '../../styles/auth/AuthResponsive.css'

export default function AuthPage() {
  const { t } = useTranslation()
  const { notifications, addNotification, removeNotification } = useNotifications()
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)

  // Form fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      if (user.isAdmin) {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    }
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      addNotification(t.auth.fillAllFields, 'error')
      return
    }

    setIsLoading(true)
    try {
      const db = new Database()

      // Try to login first
      const loginResult = await db.login(email, password)

      if (loginResult.success && loginResult.user) {
        setCurrentUser(loginResult.user)
        addNotification(loginResult.message || t.auth.loginSuccess, 'success')
        setTimeout(() => {
          navigate(loginResult.user?.isAdmin ? '/admin' : '/dashboard')
        }, 600)
        return
      }

      // If login failed, it might be that user doesn't exist.
      // Try to register. If email is taken, then login failed due to wrong password.
      const usernameFromEmail = email.split('@')[0] || 'user'
      const registerResult = await db.register(usernameFromEmail, email, password)

      if (registerResult.success && registerResult.user) {
        if ((registerResult as any).requiresVerification) {
          addNotification(registerResult.message || t.auth.codeSent, 'success')
          setPendingUserId(String(registerResult.user.id))
          setShowVerificationModal(true)
          return
        }

        setCurrentUser(registerResult.user)
        addNotification(t.auth.accountCreated, 'success')
        setTimeout(() => {
          navigate(registerResult.user?.isAdmin ? '/admin' : '/dashboard')
        }, 600)
      } else {
        // Handle registration failure
        const errorMsg = registerResult.message || ''
        if (errorMsg.includes('Email') || errorMsg.includes('уже')) {
          addNotification(t.auth.incorrectPassword, 'error')
        } else {
          addNotification(errorMsg || t.auth.authError, 'error')
        }
      }
    } catch (error) {
      addNotification(t.auth.serverError, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
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
            <LogoWithHat size={40} alt="Boolean Logo" useSvgLogo={false} />
          </div>
          <div className="auth-title-clean">
            <h2>{t.auth.welcome}</h2>
          </div>
        </div>

        <div className="auth-form-clean">
          <form onSubmit={handleSubmit} className="admin-form-clean">
            <div className="form-group-clean">
              <label>{t.auth.email}</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-clean"
                required
              />
            </div>

            <div className="form-group-clean">
              <label>{t.auth.password}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-clean"
                required
              />
            </div>

            <button type="submit" className="btn-primary-clean" disabled={isLoading}>
              {isLoading ? t.auth.processing : t.auth.continue}
            </button>
          </form>
        </div>

        <div className="auth-footer-clean">
          <a href="/" className="back-link-clean">
            {t.auth.backToMain}
          </a>
        </div>
      </div>

      {showVerificationModal && (
        <VerificationModal
          pendingUserId={pendingUserId}
          addNotification={addNotification}
          onClose={() => setShowVerificationModal(false)}
        />
      )}
    </div>
  )
}
