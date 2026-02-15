import { useState, useEffect } from 'react'
import type { User } from '../types'
import TitleBar from '../components/TitleBar'
import { useLanguage } from '../contexts/LanguageContext'
import '../styles/AuthPage.css'

const API_URL = 'https://api.booleanclient.online'

interface AuthPageProps {
  onLogin: (user: User) => void
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const { t } = useLanguage()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Слушаем OAuth callback от локального сервера
    const handleOAuthCallback = (_event: any, data: { userData?: string }) => {
      setIsLoading(false)

      if (data.userData) {
        try {
          const user = JSON.parse(decodeURIComponent(data.userData))
          // setStatusMessage(t('auth.success'))
          setHasError(false)

          onLogin(user)
        } catch (error) {
          setStatusMessage(t('auth.oauth_parse_error'))
          setHasError(true)
        }
      } else {
        setStatusMessage(t('auth.oauth_no_data'))
        setHasError(true)
      }
    }

    window.electron?.ipcRenderer.on('oauth-callback', handleOAuthCallback)

    return () => {
      window.electron?.ipcRenderer.removeListener('oauth-callback', handleOAuthCallback)
    }
  }, [onLogin])

  const resetError = () => {
    setStatusMessage('')
    setHasError(false)
    setIsLoading(false)
  }

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) return

    resetError()
    setIsLoading(true)

    try {
      // Получаем HWID
      let hwid = '';
      try {
        hwid = await window.electron?.ipcRenderer.invoke('get_hwid') || '';
      } catch (e) {
        // HWID retrieval failed, continue without it
      }

      const response = await fetch(`${API_URL}/api/auth?action=login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          usernameOrEmail: username,
          password: password,
          hwid: hwid
        })
      })

      const data = await response.json()

      if (data.success && data.data) {
        // setStatusMessage(t('auth.success'))
        onLogin(data.data)
      } else {
        setStatusMessage(data.message || t('auth.error'))
        setHasError(true)
        setIsLoading(false)
      }
    } catch (error) {
      setStatusMessage(t('auth.connection_error'))
      setHasError(true)
      setIsLoading(false)
    }
  }

  const startOAuth = async (provider: 'google' | 'github' | 'yandex') => {
    resetError()
    setIsLoading(true)

    try {
      const serverResult = await window.electron?.ipcRenderer.invoke('start-oauth-server')

      if (!serverResult?.success) {
        throw new Error(t('auth.oauth_server_error'))
      }

      // Получаем HWID
      let hwid = '';
      try {
        hwid = await window.electron?.ipcRenderer.invoke('get_hwid') || '';
      } catch (e) {
        // HWID retrieval failed, continue without it
      }

      const authUrl = `${API_URL}/api/oauth?provider=${provider}&redirect=launcher&hwid=${encodeURIComponent(hwid)}`
      window.electron?.openExternal(authUrl)

      setTimeout(() => {
        if (isLoading) {
          setIsLoading(false)
          setStatusMessage(t('auth.oauth_timeout'))
        }
      }, 120000)

    } catch (error) {
      setStatusMessage(t('auth.oauth_error'))
      setIsLoading(false)
    }
  }

  const handleWebsiteLogin = async () => {
    resetError()
    setIsLoading(true)

    try {
      const serverResult = await window.electron?.ipcRenderer.invoke('start-oauth-server')

      if (!serverResult?.success) {
        throw new Error(t('auth.oauth_server_error'))
      }

      // Получаем HWID
      let hwid = '';
      try {
        hwid = await window.electron?.ipcRenderer.invoke('get_hwid') || '';
      } catch (e) {
        // HWID retrieval failed, continue without it
      }

      // Открываем специальную страницу для входа через лаунчер (на фронтенде, не на API)
      window.electron?.openExternal(`https://booleanclient.online/launcher-auth?port=${serverResult.port}&hwid=${encodeURIComponent(hwid)}`)

      // Таймаут 2 минуты
      setTimeout(() => {
        if (isLoading) {
          setIsLoading(false)
          setStatusMessage(t('auth.oauth_timeout'))
        }
      }, 120000)

    } catch (error) {
      setStatusMessage(t('auth.oauth_error'))
      setIsLoading(false)
    }
  }

  return (
    <div className="app">
      <TitleBar />
      <div className="auth-page">
        <div className="auth-overlay"></div>
        <div className="auth-card">
          <div className="auth-header">
            <h2>{t('auth.title')}</h2>
            <p>{t('auth.subtitle')}</p>
          </div>

          <form onSubmit={handleFormLogin} className="auth-form">
            <div className="input-group">
              <input
                type="text"
                placeholder={t('auth.username')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                className="btn-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>

            {statusMessage && (
              <div className={`status-message ${hasError ? 'error' : ''}`}>
                {statusMessage}
              </div>
            )}

            <button type="submit" className="btn-login" disabled={isLoading}>
              {t('auth.login')}
            </button>
          </form>

          <div className="social-divider">
            <span>{t('auth.or')}</span>
          </div>

          <div className="social-buttons">
            <button className="social-btn google" onClick={() => startOAuth('google')} title="Google">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </button>
            <button className="social-btn github" onClick={() => startOAuth('github')} title="GitHub">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12C2 16.42 4.865 20.17 8.839 21.49C9.339 21.58 9.521 21.27 9.521 21C9.521 20.77 9.513 20.14 9.508 19.31C6.726 19.91 6.139 17.77 6.139 17.77C5.685 16.61 5.029 16.3 5.029 16.3C4.121 15.68 5.098 15.69 5.098 15.69C6.101 15.76 6.629 16.73 6.629 16.73C7.521 18.28 8.97 17.84 9.539 17.58C9.631 16.93 9.889 16.49 10.175 16.24C7.955 16 5.62 15.13 5.62 11.52C5.62 10.43 6.01 9.54 6.649 8.85C6.546 8.6 6.203 7.57 6.747 6.17C6.747 6.17 7.586 5.9 9.497 7.2C10.31 6.98 11.16 6.87 12.01 6.87C12.86 6.87 13.71 6.98 14.523 7.2C16.434 5.9 17.272 6.17 17.272 6.17C17.817 7.57 17.474 8.6 17.371 8.85C18.01 9.54 18.397 10.43 18.397 11.52C18.397 15.14 16.058 15.99 13.833 16.24C14.191 16.56 14.512 17.19 14.512 18.15C14.512 19.53 14.499 20.64 14.499 21C14.499 21.27 14.679 21.58 15.186 21.49C19.157 20.16 22 16.42 22 12C22 6.477 17.523 2 12 2Z" />
              </svg>
            </button>
            <button className="social-btn yandex" onClick={() => startOAuth('yandex')} title="Yandex">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#FC3F1D" />
                <path d="M13.5 7.5H11.2C9.3 7.5 8.5 8.6 8.5 10.1C8.5 11.9 9.4 12.8 10.7 13.7L12.3 14.8L8.3 20.5H5.5L9.2 15.2C7.4 13.9 6 12.5 6 10.1C6 7.3 7.9 5 11.2 5H16V20.5H13.5V7.5Z" fill="white" />
              </svg>
            </button>
          </div>

          <button className="btn-website-login" onClick={handleWebsiteLogin}>
            {t('auth.website_login')} <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 8 }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
