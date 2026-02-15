import { useNavigate } from 'react-router-dom'
import LogoWithHat from '../../../components/LogoWithHat'
import { IconHome, IconDownload, IconProfile, IconSubscription, IconFriends, IconShield, IconLogout } from '../../../components/Icons'
import { User } from '../../../types'
import { CLIENT_INFO, LOGO_SIZES } from '../../../utils/constants'
import { TabType } from '../hooks/useDashboard'
import { getAvatarUrl } from '../../../utils/avatarGenerator'

interface Props {
  user: User
  badge: { text: string; class: string }
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
  setShowLogoutModal: (show: boolean) => void
  t: any
}

export function DashboardSidebar({
  user,
  badge,
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  setShowLogoutModal,
  t
}: Props) {
  const navigate = useNavigate()

  return (
    <aside className={`dashboard-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <LogoWithHat
          alt="Boolean"
          size={LOGO_SIZES.sidebar}
          className="sidebar-logo no-user-drag"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        />
        <div className="sidebar-brand">
          <span className="brand-name">{CLIENT_INFO.name}</span>
          <span className="brand-version">{CLIENT_INFO.version}</span>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">
          <img src={getAvatarUrl(user.avatar)} alt={user.username} />
        </div>
        <div className="user-info">
          <span className="user-name">{user.profile?.displayName || user.username}</span>
          <span className={`user-badge ${badge.class}`}>{badge.text}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button onClick={(e) => { e.stopPropagation(); navigate('/'); setMobileMenuOpen(false); }} className="nav-item" title={t.nav.home}>
          <IconHome />
        </button>
        <button
          className={`nav-item ${activeTab === 'launcher' ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); setActiveTab('launcher'); setMobileMenuOpen(false); }}
          title={t.dashboard.launcherTab}
        >
          <IconDownload />
        </button>
        <button
          className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); setActiveTab('profile'); setMobileMenuOpen(false); }}
          title={t.dashboard.profile}
        >
          <IconProfile />
        </button>
        <button
          className={`nav-item ${activeTab === 'subscription' ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); setActiveTab('subscription'); setMobileMenuOpen(false); }}
          title={t.dashboard.subscription}
        >
          <IconSubscription />
        </button>
        <button
          className={`nav-item ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); setActiveTab('friends'); setMobileMenuOpen(false); }}
          title={t.dashboard.friends}
        >
          <IconFriends />
        </button>
      </nav>

      <div className="sidebar-links">
        {user.isAdmin && (
          <button onClick={(e) => { e.stopPropagation(); navigate('/admin'); setMobileMenuOpen(false); }} className="link-item" title={t.dashboard.adminPanel}>
            <IconShield size={18} />
          </button>
        )}
      </div>

      <div className="sidebar-footer">
        <button onClick={(e) => { e.stopPropagation(); setShowLogoutModal(true); }} className="logout-btn" title={t.nav.logout}>
          <IconLogout size={18} />
        </button>
      </div>
    </aside>
  )
}
