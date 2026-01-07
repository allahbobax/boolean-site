import * as React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Database, setCurrentUser } from '../../../utils/database'
import { NotificationType } from '../../../types'
import { FiEye, FiEyeOff } from 'react-icons/fi'

interface EmailLoginModalProps {
  isOpen: boolean
  onClose: () => void
  setNotification: (notification: { message: string; type: NotificationType } | null) => void
}

export function EmailLoginModal({ isOpen, onClose, setNotification }: EmailLoginModalProps) {
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!emailOrUsername || !password) {
      setNotification({ message: 'Заполните все поля', type: 'error' })
      return
    }

    setIsLoading(true)
    try {
      const db = new Database()
      const result = await db.login(emailOrUsername, password)

      if (result.success && result.user) {
        setCurrentUser(result.user)
        setNotification({ message: result.message || 'Вход выполнен!', type: 'success' })
        onClose()

        setTimeout(() => {
          if (result.user?.isAdmin) {
            navigate('/admin')
          } else {
            navigate('/dashboard')
          }
        }, 600)
      } else {
        setNotification({ message: result.message || 'Неверный логин или пароль', type: 'error' })
      }
    } catch (error) {
      setNotification({ message: 'Ошибка подключения к серверу', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setEmailOrUsername('')
      setPassword('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content email-login-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Вход через Email</h3>
          <button className="modal-close" onClick={handleClose} disabled={isLoading}>
            ×
          </button>
        </div>
        
        <form onSubmit={handleLogin} className="admin-form-clean">
          <div className="form-group-clean">
            <label htmlFor="email-login-modal">Email</label>
            <input
              id="email-login-modal"
              type="email"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              placeholder="you@example.com"
              className="input-clean"
              required
            />
          </div>

          <div className="form-group-clean">
            <label htmlFor="password-login-modal">Пароль</label>
            <div className="password-input-wrapper">
              <input
                id="password-login-modal"
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

          <button type="submit" className="btn-primary-clean" disabled={isLoading}>
            {isLoading ? 'Входим...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  )
}
