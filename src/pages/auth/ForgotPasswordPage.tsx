import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import NotificationContainer from '../../components/NotificationContainer'
import LogoWithHat from '../../components/LogoWithHat'
import Navigation from '../../components/Navigation'
import { useNotifications } from '../../hooks/useNotifications'
import { LOGO_SIZES } from '../../utils/constants'
import OAuthButtons from '../../components/OAuthButtons'
import '../../styles/auth/AuthBase.css'
import '../../styles/auth/AuthForm.css'
import '../../styles/auth/AuthModal.css'
import '../../styles/auth/OAuth.css'

const API_URL = 'https://api.booleanclient.online'

type Step = 'email' | 'oauth-check' | 'complete'

export default function ForgotPasswordPage() {
    const { notifications, addNotification, removeNotification } = useNotifications()
    const [step, setStep] = useState<Step>('email')
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [foundProvider, setFoundProvider] = useState<'google' | 'discord' | null>(null)
    const navigate = useNavigate()

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) {
            addNotification('Введите email', 'error')
            return
        }
        setIsLoading(true)
        try {
            // Check if user exists with this email and get OAuth provider
            const res = await fetch(`${API_URL}/auth/check-oauth-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })
            const data = await res.json()
            if (data.success && data.provider) {
                setFoundProvider(data.provider)
                setStep('oauth-check')
                addNotification(`Найден аккаунт через ${data.provider === 'google' ? 'Google' : 'Discord'}`, 'success')
            } else {
                addNotification('Аккаунт с таким email не найден', 'error')
            }
        } catch {
            addNotification('Ошибка подключения к серверу', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    const handleOAuthError = (error: string) => {
        addNotification(error, 'error')
    }

    return (
        <div className="auth-fullscreen">
            <Navigation />
            <div className="auth-page-centered">
                {notifications.length > 0 && (
                    <NotificationContainer notifications={notifications} onClose={removeNotification} />
                )}
                <div className="auth-box-clean">
                    <div className="auth-header">
                        <div className="auth-logo-small">
                            <LogoWithHat size={LOGO_SIZES.auth} alt="Boolean Logo" />
                        </div>
                        <div className="auth-title-clean">
                            <h2>{step === 'email' ? 'Сброс пароля' : step === 'oauth-check' ? 'Подтвердите вход' : 'Готово!'}</h2>
                            <p>
                                {step === 'email' && 'Введите email для поиска аккаунта'}
                                {step === 'oauth-check' && `Войдите через ${foundProvider === 'google' ? 'Google' : 'Discord'} для сброса пароля`}
                                {step === 'complete' && 'Пароль успешно сброшен'}
                            </p>
                        </div>
                    </div>

                    <div className="auth-form-clean">
                        {step === 'email' && (
                            <form onSubmit={handleEmailSubmit} className="admin-form-clean">
                                <div className="form-group-clean">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="input-clean"
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn-primary-clean" disabled={isLoading}>
                                    {isLoading ? 'Поиск...' : 'Найти аккаунт'}
                                </button>
                            </form>
                        )}

                        {step === 'oauth-check' && foundProvider && (
                            <div className="oauth-reset-section">
                                <p style={{ marginBottom: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    Мы нашли ваш аккаунт через {foundProvider === 'google' ? 'Google' : 'Discord'}. 
                                    Войдите снова для подтверждения и сброса пароля.
                                </p>
                                <OAuthButtons onError={handleOAuthError} />
                            </div>
                        )}

                        {step === 'complete' && (
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ color: 'var(--text-success)', marginBottom: '20px' }}>
                                    ✓ Пароль успешно сброшен
                                </p>
                                <button 
                                    onClick={() => navigate('/auth')} 
                                    className="btn-primary-clean"
                                >
                                    Перейти к входу
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="auth-footer-clean">
                        <Link to="/auth" className="back-link-clean">Назад</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
