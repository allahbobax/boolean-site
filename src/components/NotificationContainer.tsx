import { NotificationType } from '../types'

import Notification from './Notification'

import '../styles/Notification.css'



export interface NotificationItem {

  id: string

  message: string

  type: NotificationType

}



interface NotificationContainerProps {

  notifications: NotificationItem[]

  onClose: (id: string) => void

}



export default function NotificationContainer({ notifications, onClose }: NotificationContainerProps) {

  return (

    <div className="notification-container">

      {notifications.map((notification) => (

        <Notification

          key={notification.id}

          message={notification.message}

          type={notification.type}

          onClose={() => onClose(notification.id)}

        />

      ))}

    </div>

  )

}

