import { User } from '../../../types'
import { IconProfile, IconCalendar, IconCheck, IconMonitor, IconCart, IconDownload, IconKey } from '../../../components/Icons'

interface Props {
  user: User
  badge: { text: string; class: string }
  formatDate: (date: string) => string
  handleBuyClient: (productId?: string) => void
  handleDownloadLauncher: (platform: 'windows' | 'macos' | 'linux') => void
  setActiveTab: (tab: 'launcher' | 'profile' | 'subscription' | 'friends') => void
  t: any
}

export function OverviewTab({
  user,
  badge,
  formatDate,
  handleBuyClient,
  handleDownloadLauncher,
  setActiveTab,
  t
}: Props) {
  return (
    <div className="dashboard-content">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <IconProfile size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">{t.dashboard.status}</span>
            <span className={`stat-value ${badge.class}`}>{badge.text}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <IconCalendar size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">{t.dashboard.registration}</span>
            <span className="stat-value">{formatDate(user.registeredAt)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <IconCheck size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">{t.dashboard.emailStatus}</span>
            <span className="stat-value">{user.emailVerified ? t.dashboard.verified : t.dashboard.notVerified}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon white">
            <IconMonitor size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">{t.dashboard.hwid}</span>
            <span className="stat-value hwid">{user.hwid || t.dashboard.notLinked}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>{t.dashboard.quickActions}</h2>
        <div className="actions-grid">
          <button className="action-card primary" onClick={() => handleBuyClient()}>
            <div className="action-icon">
              <IconCart size={28} />
            </div>
            <span className="action-title">{t.dashboard.buyClient}</span>
          </button>

          <button className="action-card" onClick={() => handleDownloadLauncher('windows')}>
            <div className="action-icon">
              <IconDownload size={28} />
            </div>
            <span className="action-title">{t.dashboard.downloadLauncher}</span>
          </button>

          <button className="action-card" onClick={() => setActiveTab('subscription')}>
            <div className="action-icon">
              <IconKey size={28} />
            </div>
            <span className="action-title">{t.dashboard.activateKey}</span>
          </button>

                  </div>
      </div>

      {/* Profile Info */}
      <div className="profile-card">
        <h2>{t.dashboard.profileInfo}</h2>
        <div className="profile-details">
          <div className="detail-row">
            <span className="detail-label">{t.dashboard.uid}</span>
            <span className="detail-value mono">{user.id}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">{t.dashboard.login}</span>
            <span className="detail-value">{user.username}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">{t.dashboard.email}</span>
            <span className="detail-value">{user.email}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">{t.dashboard.subscription}</span>
            <span className={`detail-value ${badge.class}`}>{badge.text}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
