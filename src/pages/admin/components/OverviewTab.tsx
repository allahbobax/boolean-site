import { User } from '../../../types'

interface OverviewTabProps {
  users: User[]
}

export function OverviewTab({ users }: OverviewTabProps) {
  return (
    <div className="admin-section">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">
            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="10" cy="6" r="4"/>
              <path d="M10 12C5.58172 12 2 14.6863 2 18H18C18 14.6863 14.4183 12 10 12Z"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{users.length}</div>
            <div className="stat-label">Всего пользователей</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2ZM13.7071 8.70711L9.70711 12.7071C9.31658 13.0976 8.68342 13.0976 8.29289 12.7071L6.29289 10.7071C5.90237 10.3166 5.90237 9.68342 6.29289 9.29289C6.68342 8.90237 7.31658 8.90237 7.70711 9.29289L9 10.5858L12.2929 7.29289C12.6834 6.90237 13.3166 6.90237 13.7071 7.29289C14.0976 7.68342 14.0976 8.31658 13.7071 8.70711Z"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{users.filter(u => !u.isBanned).length}</div>
            <div className="stat-label">Активных пользователей</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon white">
            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2L12.5 7L18 8L14 12L15 18L10 15L5 18L6 12L2 8L7.5 7L10 2Z"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{users.filter(u => u.subscription === 'premium' || u.subscription === 'alpha').length}</div>
            <div className="stat-label">Премиум подписок</div>
          </div>
        </div>
      </div>

    </div>
  )
}
