import { useLanguage } from '../contexts/LanguageContext'
import type { User } from '../types'
import '../styles/Sidebar.css'

interface SidebarProps {
  activeTab: 'home' | 'profile' | 'settings'
  onTabChange: (tab: 'home' | 'profile' | 'settings') => void
  user: User
  onLogout?: () => void
}

export default function Sidebar({ activeTab, onTabChange, onLogout }: SidebarProps) {
  const { t } = useLanguage()

  return (
    <div className="sidebar">
      <div className="sidebar-nav">
        {/* Home */}
        <div
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => onTabChange('home')}
          title={t('sidebar.home')}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3L4 9V21H9V14H15V21H20V9L12 3Z" />
          </svg>
        </div>

        {/* Profile */}
        <div
          className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => onTabChange('profile')}
          title={t('sidebar.profile')}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="8" r="4" />
            <path d="M12 14C7.58 14 4 16.69 4 20V21H20V20C20 16.69 16.42 14 12 14Z" />
          </svg>
        </div>

        {/* Settings */}
        <div
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => onTabChange('settings')}
          title={t('sidebar.settings')}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
          </svg>
        </div>
      </div>

      {/* Logout at bottom */}
      <div className="sidebar-bottom">
        <button
          className="logout-btn"
          onClick={onLogout}
          title={t('sidebar.logout')}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
