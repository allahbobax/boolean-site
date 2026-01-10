import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import NotificationContainer from '../../components/NotificationContainer'
import LogoWithHat from '../../components/LogoWithHat'
import Navigation from '../../components/Navigation'
import { TurnstileWidget } from '../../components/TurnstileWidget'
import { getCurrentUser, Database, setCurrentUser } from '../../utils/database'
import { useNotifications } from '../../hooks/useNotifications'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import '../../styles/auth/AuthBase.css'
import '../../styles/auth/AuthForm.css'
import '../../styles/auth/AuthModal.css'

export default function LoginPage() {
    const { notifications, addNotification, removeNotification } = useNotifications()
    const [login, setLogin] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

    const navigate = useNavigate()

    const handleTurnstileVerify = useCallback((token: string) => {
        setTurnstileToken(token)
    }, [])

    const handleTurnstileError = useCallback(() => {
        setTurnstileToken(null)
        addNotification('Ошибка проверки безопасности. Обновите страницу.', 'error')
    }, [addNotification])

    const handleTurnstileExpire = useCallback(() => {
        setTurnstileToken(null)
    }, [])

    useEffect(() => {
        const user = getCurrentUser()
        if (user) {
            navigate(user.isAdmin ? '/admin' : '/dashboard')
        }
    }, [navigate])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!login || !password) {
            addNotification('Заполните все поля', 'error')
            return
        }

        if (!turnstileToken) {
            addNotification('Пожалуйста, пройдите проверку безопасности', 'error')
            return
        }

        setIsLoading(true)
        try {
            const db = new Database()
            const result = await db.login(login, password, turnstileToken)

            if (result.success && result.user) {
                setCurrentUser(result.user)
                addNotification('Вход выполнен!', 'success')
                setTimeout(() => {
                    navigate(result.user?.isAdmin ? '/admin' : '/dashboard')
                }, 600)
            } else {
                addNotification(result.message || 'Неверный логин или пароль', 'error')
            }
        } catch (error) {
            addNotification('Ошибка подключения к серверу', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="auth-fullscreen">
            <Navigation onLanguageChange={() => { }} />

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
                            <LogoWithHat size={40} alt="Boolean Logo" />
                        </div>
                        <div className="auth-title-clean">
                            <h2>Welcome back!</h2>
                            <p>You dont gave account? <Link to="/register" className="auth-link-accent">Sign up right now!</Link></p>
                        </div>
                    </div>

                    <div className="auth-form-clean">
                        <form onSubmit={handleSubmit} className="admin-form-clean">
                            <div className="form-group-clean">
                                <label>Login</label>
                                <input
                                    type="text"
                                    value={login}
                                    onChange={(e) => setLogin(e.target.value)}
                                    placeholder="Username"
                                    className="input-clean"
                                    required
                                />
                            </div>

                            <div className="form-group-clean">
                                <label>Password</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="input-clean"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </button>
                                </div>
                                <Link to="/forgot-password" className="auth-link-muted">
                                    Forgot Password?
                                </Link>
                            </div>

                            <TurnstileWidget
                                onVerify={handleTurnstileVerify}
                                onError={handleTurnstileError}
                                onExpire={handleTurnstileExpire}
                                theme="dark"
                                autoRender={false}
                            />

                            <button type="submit" className="btn-primary-clean" disabled={isLoading}>
                                {isLoading ? 'Processing...' : 'Sign In'}
                            </button>
                        </form>
                    </div>

                    <div className="auth-footer-clean">
                        <Link to="/" className="back-link-clean">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
