import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../../hooks/useTheme'

type TabType = 'users' | 'activity' | 'keys' | 'versions' | 'incidents'

interface AdminSidebarProps {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  usersCount: number
  availableKeysCount: number
  onLogoutClick: () => void
}

export function AdminSidebar({
  activeTab,
  setActiveTab,
  usersCount,
  availableKeysCount,
  onLogoutClick
}: AdminSidebarProps) {
  const navigate = useNavigate()
  const theme = useTheme()
  const logoSrc = theme === 'light' ? '/icon1.png' : '/icon.png'

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <img
          src={logoSrc}
          alt="Boolean Logo"
          className="admin-logo"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        />
        <h1>Boolean <span>Admin</span></h1>
      </div>

      <nav className="admin-nav">
        <button
          className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <circle cx="10" cy="6" r="4" />
            <path d="M10 12C5.58172 12 2 14.6863 2 18H18C18 14.6863 14.4183 12 10 12Z" />
          </svg>
          <span>Пользователи</span>
          {usersCount > 0 && <span className="badge">{usersCount}</span>}
        </button>

        <button
          className={`admin-nav-item ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 10H6L8 4L12 16L14 10H18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Активность</span>
        </button>

        <button
          className={`admin-nav-item ${activeTab === 'keys' ? 'active' : ''}`}
          onClick={() => setActiveTab('keys')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
          </svg>
          <span>Ключи</span>
          {availableKeysCount > 0 && <span className="badge">{availableKeysCount}</span>}
        </button>

        <button
          className={`admin-nav-item ${activeTab === 'versions' ? 'active' : ''}`}
          onClick={() => setActiveTab('versions')}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 2h12a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2zm0 2v12h12V4H4zm2 2h8v2H6V6zm0 4h8v2H6v-2z" />
          </svg>
          <span>Версии</span>
        </button>

        <button
          className={`admin-nav-item ${activeTab === 'incidents' ? 'active' : ''}`}
          onClick={() => setActiveTab('incidents')}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2L2 18h16L10 2zm0 4l5.5 10h-11L10 6zm-1 4v3h2v-3H9zm0 4v2h2v-2H9z" />
          </svg>
          <span>Инциденты</span>
        </button>
      </nav>

      <div className="admin-nav-bottom">
        <button className="admin-nav-item" onClick={() => navigate('/dashboard')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2L2 7v11h6v-6h4v6h6V7l-8-5z" />
          </svg>
          <span>Личный кабинет</span>
        </button>

        <button className="admin-nav-item" onClick={() => navigate('/')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 7a1 1 0 112 0v4a1 1 0 11-2 0V7zm1 8a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
          <span>На сайт</span>
        </button>
      </div>

      <button className="btn-logout" onClick={onLogoutClick}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 3h8v2H5v10h6v2H3V3zm12.5 4.5l3.5 3.5-3.5 3.5-1.4-1.4 1.6-1.6H9v-2h6.7l-1.6-1.6 1.4-1.4z" />
        </svg>
        <span>Выйти</span>
      </button>
    </aside>
  )
}
