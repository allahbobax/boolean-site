import { useState, useCallback } from 'react'
import { NotificationType } from '../types'
import { NotificationItem } from '../components/NotificationContainer'

let notificationId = 0

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  const addNotification = useCallback((message: string, type: NotificationType) => {
    const id = `notification-${++notificationId}`
    setNotifications(prev => [...prev, { id, message, type }])
    return id
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll
  }
}
