import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import NotificationContainer from '../../components/NotificationContainer'
import LogoWithHat from '../../components/LogoWithHat'
import Navigation from '../../components/Navigation'
import { useNotifications } from '../../hooks/useNotifications'
import { useTranslation } from '../../hooks/useTranslation'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import '../../styles/auth/AuthBase.css'
import '../../styles/auth/AuthForm.css'
import '../../styles/auth/AuthModal.css'

const API_URL = 'https://api.booleanclient.ru'

type Step = 'email' | 'code' | 'password'

export default function ForgotPasswordPage() {
    const { notifications, addNotification, removeNotification } = useNotifications()
    useTranslation()
    const [step, setStep] = useState<Step>('email')
    const [email, setEmail] = useState('')
    const [userId, setUserId] = useState<string | null>(null)
    const [code, setCode] = useState(['', '', '', '', '', ''])
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()
    const inputRefs = useRef<Array<HTMLInputElement | null>>([])

    useEffect(() => {
        if (step === 'code') {
            inputRefs.current[0]?.focus()
        }
    }, [step])

    const focusIndex = (index: number) => {
        inputRefs.current[index]?.focus()
        inputRefs.current[index]?.select()
    }

    const handleCodeChange = (index: number, rawValue: string) => {
        if (!rawValue) {
            const newCode = [...code]
            newCode[index] = ''
        }
        const digits = rawValue.replace(/\D/g, '')
        if (!digits) return
        if (digits.length === 1) {
            const newCode = [...code]
            newCode[index] = digits
            setCode(newCode)
            if (index < 5) focusIndex(index + 1)
            return
        }
        applyDigitsFrom(index, digits)
    }

    const applyDigitsFrom = (startIndex: number, raw: string) => {
        const digits = raw.replace(/\D/g, '')
        if (!digits) return
        const newCode = [...code]
        let idx = startIndex
        for (const d of digits) {
            if (idx > 5) break
            newCode[idx] = d
            idx += 1
        }
        setCode(newCode)
        if (idx <= 5) focusIndex(idx)
        else focusIndex(5)
    }

    const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
        if ((e.key === 'a' || e.key === 'A') && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            setCode(['', '', '', '', '', ''])
            focusIndex(0)
            return
        }
        if (e.key === 'Backspace') {
            if (!code[index] && index > 0) {
                focusIndex(index - 1)
                return
            }
            if (code[index]) {
                const newCode = [...code]
                newCode[index] = ''
                setCode(newCode)
                e.preventDefault()
                return
            }
        }
        if (e.key === 'ArrowLeft' && index > 0) {
            e.preventDefault()
            focusIndex(index - 1)
        }
        if (e.key === 'ArrowRight' && index < 5) {
            e.preventDefault()
            focusIndex(index + 1)
        }
    }

    const handleCodePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const firstEmpty = code.findIndex((d) => !d)
        applyDigitsFrom(firstEmpty === -1 ? 0 : firstEmpty, e.clipboardData.getData('text'))
    }

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) {
            addNotification('Введите email', 'error')
            return
        }
        setIsLoading(true)
        try {
            const res = await fetch(`${API_URL}/auth?action=forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })
            const data = await res.json()
            if (data.success) {
                setUserId(data.userId)
                setStep('code')
                addNotification('Код отправлен на email', 'success')
            } else {
                addNotification(data.message || 'Ошибка', 'error')
            }
        } catch {
            addNotification('Ошибка подключения к серверу', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const codeStr = code.join('')
        if (codeStr.length !== 6) {
            addNotification('Введите 6-значный код', 'error')
            return
        }
        setIsLoading(true)
        try {
            const res = await fetch(`${API_URL}/auth?action=verify-reset-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, code: codeStr })
            })
            const data = await res.json()
            if (data.success) {
                setStep('password')
                addNotification('Код подтвержден', 'success')
            } else {
                addNotification(data.message || 'Неверный код', 'error')
            }
        } catch {
            addNotification('Ошибка подключения к серверу', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newPassword || !confirmPassword) {
            addNotification('Заполните все поля', 'error')
            return
        }
        if (newPassword.length < 6) {
            addNotification('Пароль минимум 6 символов', 'error')
            return
        }
        if (newPassword !== confirmPassword) {
            addNotification('Пароли не совпадают', 'error')
            return
        }
        setIsLoading(true)
        try {
            const res = await fetch(`${API_URL}/auth?action=reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, code: code.join(''), newPassword })
            })
            const data = await res.json()
            if (data.success) {
                addNotification('Пароль успешно изменен!', 'success')
                setTimeout(() => navigate('/login'), 1500)
            } else {
                addNotification(data.message || 'Ошибка', 'error')
            }
        } catch {
            addNotification('Ошибка подключения к серверу', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    const handleResendCode = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${API_URL}/auth?action=forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })
            const data = await res.json()
            if (data.success) {
                setCode(['', '', '', '', '', ''])
                addNotification('Новый код отправлен', 'success')
            } else {
                addNotification(data.message || 'Ошибка', 'error')
            }
        } catch {
            addNotification('Ошибка подключения', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="auth-fullscreen">
            <Navigation onLanguageChange={() => {}} />
            <div className="auth-page-centered">
                {notifications.length > 0 && (
                    <NotificationContainer notifications={notifications} onClose={removeNotification} />
                )}
                <div className="auth-box-clean">
                    <div className="auth-header">
                        <div className="auth-logo-small">
                            <LogoWithHat size={40} alt="Boolean Logo" />
                        </div>
                        <div className="auth-title-clean">
                            <h2>{step === 'email' ? 'Forgot Password?' : step === 'code' ? 'Enter Code' : 'New Password'}</h2>
                            <p>
                                {step === 'email' && 'Enter your email to receive a reset code'}
                                {step === 'code' && 'We sent a 6-digit code to your email'}
                                {step === 'password' && 'Create a new password for your account'}
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
                                    {isLoading ? 'Sending...' : 'Send Code'}
                                </button>
                            </form>
                        )}

                        {step === 'code' && (
                            <form onSubmit={handleCodeSubmit} className="admin-form-clean">
                                <div className="email-verification-code-inputs" onPaste={handleCodePaste}>
                                    {code.map((digit, index) => (
                                        <input
                                            key={index}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleCodeChange(index, e.target.value)}
                                            onKeyDown={(e) => handleCodeKeyDown(index, e)}
                                            onFocus={() => inputRefs.current[index]?.select()}
                                            inputMode="numeric"
                                            ref={(el) => { inputRefs.current[index] = el }}
                                            className="email-verification-code-input"
                                        />
                                    ))}
                                </div>
                                <button type="submit" className="btn-primary-clean" disabled={isLoading || code.join('').length !== 6} style={{ marginTop: '20px' }}>
                                    {isLoading ? 'Verifying...' : 'Verify Code'}
                                </button>
                                <button type="button" className="btn-text-only" onClick={handleResendCode} disabled={isLoading}>
                                    Resend Code
                                </button>
                            </form>
                        )}

                        {step === 'password' && (
                            <form onSubmit={handlePasswordSubmit} className="admin-form-clean">
                                <div className="form-group-clean">
                                    <label>New Password</label>
                                    <div className="password-input-wrapper">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="input-clean"
                                            required
                                        />
                                        <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
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
                                        <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}>
                                            {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" className="btn-primary-clean" disabled={isLoading}>
                                    {isLoading ? 'Saving...' : 'Reset Password'}
                                </button>
                            </form>
                        )}
                    </div>

                    <div className="auth-footer-clean">
                        <Link to="/login" className="back-link-clean">Back to Login</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
