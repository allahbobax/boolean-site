import * as React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Database, setCurrentUser } from '../../../utils/database'
import { NotificationType } from '../../../types'

interface AdminLoginFormProps {
  setNotification: (notification: { message: string; type: NotificationType } | null) => void
  onBack: () => void
}

export function AdminLoginForm({ setNotification, onBack }: AdminLoginFormProps) {
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const navigate = useNavigate()

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!adminEmail || !adminPassword) {
      setNotification({ message: 'Заполните все поля', type: 'error' })
      return
    }

    try {
      const db = new Database()
      const result = await db.adminLogin(adminEmail, adminPassword)

      if (result.success && result.user) {
        setCurrentUser(result.user)
        setNotification({ message: 'Вход администратора выполнен!', type: 'success' })
        setTimeout(() => navigate('/admin'), 1500)
      } else {
        setNotification({ message: result.message || 'Неверные данные администратора', type: 'error' })
      }
    } catch (error) {
      setNotification({ message: 'Ошибка подключения к серверу', type: 'error' })
    }
  }

  return (
    <>
      <form onSubmit={handleAdminLogin} className="admin-form-clean">
        <div className="form-group-clean">
          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="admin@example.com"
            className="input-clean"
            required
          />
        </div>

        <div className="form-group-clean">
          <label htmlFor="admin-password">Пароль</label>
          <input
            id="admin-password"
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            placeholder="••••••••"
            className="input-clean"
            required
          />
        </div>

        <button type="submit" className="btn-primary-clean">
          Войти
        </button>
      </form>

      <button
        onClick={onBack}
        className="btn-text-only"
        style={{ marginTop: '16px' }}
      >
        Вернуться назад
      </button>
    </>
  )
}
