import * as React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Database, setCurrentUser } from '../../../utils/database'
import { NotificationType } from '../../../types'

interface EmailLoginFormProps {
  setNotification: (notification: { message: string; type: NotificationType } | null) => void
}

export function EmailLoginForm({ setNotification }: EmailLoginFormProps) {
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
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

  return (
    <form onSubmit={handleLogin} className="admin-form-clean">
      <div className="form-group-clean">
        <label htmlFor="email-login">Email</label>
        <input
          id="email-login"
          type="email"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          placeholder="you@example.com"
          className="input-clean"
          required
        />
      </div>

      <div className="form-group-clean">
        <label htmlFor="password-login">Пароль</label>
        <input
          id="password-login"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="input-clean"
          required
        />
      </div>

      <button type="submit" className="btn-primary-clean" disabled={isLoading}>
        {isLoading ? 'Входим...' : 'Войти через email'}
      </button>
    </form>
  )
}
