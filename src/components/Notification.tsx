import { useEffect } from 'react'
import { NotificationType } from '../types'
import '../styles/Notification.css'

interface NotificationProps {
  message: string
  type: NotificationType
  onClose: () => void
  autoClose?: boolean
}

export default function Notification({ message, type, onClose, autoClose = true }: NotificationProps) {
  useEffect(() => {
    if (!autoClose) return
    
    const timer = setTimeout(() => {
      onClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose, autoClose])

  return (
    <div className={`notification notification-${type} show`}>
      <div className="notification-content">
        <svg className="notification-icon" viewBox="0 0 20 20" fill="none">
          {type === 'success' ? (
            <path d="M16 6L8 14L4 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          ) : (
            <>
              <path d="M10 6V10M10 14H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2"/>
            </>
          )}
        </svg>
        <span>{message}</span>
      </div>
      <button className="notification-close" onClick={onClose} aria-label="Close">
        <svg viewBox="0 0 14 14" fill="none">
          <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  )
}
