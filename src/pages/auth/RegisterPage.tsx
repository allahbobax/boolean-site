import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import NotificationContainer from '../../components/NotificationContainer'
import Navigation from '../../components/Navigation'
import { VerificationModal } from './components/VerificationModal'
import { getCurrentUser, Database, setCurrentUser } from '../../utils/database'
import { useNotifications } from '../../hooks/useNotifications'
import { useTranslation } from '../../hooks/useTranslation'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import '../../styles/auth/AuthBase.css'
import '../../styles/auth/AuthForm.css'
import '../../styles/auth/AuthModal.css'

// Список запрещённых слабых паролей
const WEAK_PASSWORDS = [
    '123456', '123456789', '12345678', '1234567', '12345', '1234567890',
    'password', 'password1', 'password123', 'qwerty', 'qwerty123',
    'abc123', 'abcdef', 'abcd1234', '111111', '000000', '123123',
    'admin', 'admin123', 'letmein', 'welcome', 'monkey', 'dragon',
    'master', 'login', 'princess', 'solo', 'passw0rd', 'shadow',
    'sunshine', 'iloveyou', 'trustno1', 'football', 'baseball',
    'qwertyuiop', 'asdfghjkl', 'zxcvbnm', '1q2w3e4r', '1qaz2wsx',
    'qazwsx', 'test', 'test123', 'guest', 'guest123', 'changeme'
]

// Проверка сложности пароля
type PasswordValidationKey = 'passwordTooCommon' | 'passwordTooShort' | 'passwordRepeatingDigits' | 'passwordSimpleSequence' | 'passwordNeedsLetterAndNumber'

function validatePassword(password: string): { valid: boolean; messageKey: PasswordValidationKey | null } {
    const lowerPassword = password.toLowerCase()
    
    // Проверка на слабые пароли из списка
    if (WEAK_PASSWORDS.includes(lowerPassword)) {
        return { valid: false, messageKey: 'passwordTooCommon' }
    }
    
    // Минимальная длина
    if (password.length < 8) {
        return { valid: false, messageKey: 'passwordTooShort' }
    }
    
    // Проверка на последовательности цифр (123456, 654321 и т.д.)
    if (/^(\d)\1+$/.test(password)) {
        return { valid: false, messageKey: 'passwordRepeatingDigits' }
    }
    
    // Проверка на простые последовательности
    const sequences = ['0123456789', '9876543210', 'abcdefghijklmnopqrstuvwxyz', 'zyxwvutsrqponmlkjihgfedcba']
    for (const seq of sequences) {
        if (seq.includes(lowerPassword) && password.length >= 4) {
            return { valid: false, messageKey: 'passwordSimpleSequence' }
        }
    }
    
    // Проверка на наличие хотя бы одной буквы и одной цифры
    const hasLetter = /[a-zA-Z]/.test(password)
    const hasNumber = /\d/.test(password)
    
    if (!hasLetter || !hasNumber) {
        return { valid: false, messageKey: 'passwordNeedsLetterAndNumber' }
    }
    
    return { valid: true, messageKey: null }
}

export default function RegisterPage() {
    const { t } = useTranslation()
    const { notifications, addNotification, removeNotification } = useNotifications()
    const [showVerificationModal, setShowVerificationModal] = useState(false)
    const [pendingUserId, setPendingUserId] = useState<string | null>(null)

    const [email, setEmail] = useState('')
    const [login, setLogin] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const navigate = useNavigate()

    useEffect(() => {
        const user = getCurrentUser()
        if (user) {
            navigate(user.isAdmin ? '/admin' : '/dashboard')
        }
    }, [navigate])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email || !login || !password || !confirmPassword) {
            addNotification('Please fill all fields', 'error')
            return
        }

        if (password !== confirmPassword) {
            addNotification('Passwords do not match', 'error')
            return
        }

        // Проверка сложности пароля
        const passwordValidation = validatePassword(password)
        if (!passwordValidation.valid && passwordValidation.messageKey) {
            addNotification(t.auth[passwordValidation.messageKey], 'error')
            return
        }

        setIsLoading(true)
        try {
            const db = new Database()
            const result = await db.register(login, email, password)

            if (result.success && result.user) {
                if ((result as any).requiresVerification) {
                    addNotification(result.message || 'Verification code sent to email', 'success')
                    setPendingUserId(String(result.user.id))
                    setShowVerificationModal(true)
                } else {
                    setCurrentUser(result.user)
                    addNotification('Account created!', 'success')
                    setTimeout(() => {
                        navigate(result.user?.isAdmin ? '/admin' : '/dashboard')
                    }, 600)
                }
            } else {
                addNotification(result.message || 'Registration failed', 'error')
            }
        } catch (error) {
            addNotification('Server connection error', 'error')
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
                        <div className="auth-title-clean">
                            <h2>Hello, New User!</h2>
                            <p>You already registered? <Link to="/login" className="auth-link-accent">Sign in right now!</Link></p>
                        </div>
                    </div>

                    <div className="auth-form-clean">
                        <form onSubmit={handleSubmit} className="admin-form-clean">
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
                            </div>

                            <div className="form-group-clean">
                                <label>Confirm Password</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="input-clean"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="btn-primary-clean" disabled={isLoading}>
                                {isLoading ? 'Processing...' : 'Sign Up'}
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
