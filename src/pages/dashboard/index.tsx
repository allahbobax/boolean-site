import { useState, useEffect } from 'react'
import NotificationContainer from '../../components/NotificationContainer'
import { LogoutModal } from '../../components/LogoutModal'
import { SoonModal } from '../../components/SoonModal'
import { useDashboard } from './hooks/useDashboard'
import { useLocation, useNavigate } from 'react-router-dom'
import { getAvatarUrl } from '../../utils/avatarGenerator'
import Navigation from '../../components/Navigation'
import {
  IconProfile,
  IconKey,
  IconCheck,
  IconArrowRight,
  IconMail,
  IconClock,
  IconDownload,
  IconChip,
  IconLogout,
  IconShield,
} from '../../components/Icons'
import { WindowsIcon, MacIcon, LinuxIcon } from '../../components/icons/OSIcons'
import { DOWNLOAD_LINKS } from '../../utils/constants'
import { Friends } from '../../components/Friends'

import '../../styles/dashboard/DashboardBase.css'
import '../../styles/dashboard/DownloadButtons.css'

export default function DashboardPage() {
  const {
    user,
    notifications,
    addNotification,
    removeNotification,
    showLogoutModal,
    setShowLogoutModal,
    showSoonModal,
    setShowSoonModal,
    keyInput,
    setKeyInput,
    activeTab,
    setActiveTab,
    t,
    handleLogout,
    handleActivateKey,
    formatDate,
  } = useDashboard()

  const [friendsOpen, setFriendsOpen] = useState(false)
  const [friendsCount, setFriendsCount] = useState(() => {
    // Load cached count immediately
    const cached = localStorage.getItem('friendsCache')
    if (cached) {
      try {
        const { count } = JSON.parse(cached)
        return count || 0
      } catch { return 0 }
    }
    return 0
  })
  const [friendsData, setFriendsData] = useState<any[]>(() => {
    // Load cached friends data
    const cached = localStorage.getItem('friendsCache')
    if (cached) {
      try {
        const { data } = JSON.parse(cached)
        return data || []
      } catch { return [] }
    }
    return []
  })

  const API_URL = 'https://api.booleanclient.online'

  // Fetch friends with caching
  useEffect(() => {
    if (!user?.id) return

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    fetch(`${API_URL}/friends?userId=${user.id}`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const accepted = data.data.filter((f: any) => f.status === 'accepted')
          setFriendsCount(accepted.length)
          setFriendsData(data.data)
          // Cache for instant load next time
          localStorage.setItem('friendsCache', JSON.stringify({
            count: accepted.length,
            data: data.data,
            timestamp: Date.now()
          }))
        }
      })
      .catch(() => { })
      .finally(() => clearTimeout(timeoutId))

    return () => {
      controller.abort()
      clearTimeout(timeoutId)
    }
  }, [user?.id, friendsOpen])

  const handleDownloadLauncher = (platform: 'windows_exe' | 'windows_msi' | 'macos' | 'macos_arm64' | 'linux_rpm' | 'linux_deb' | 'linux_appimage') => {
    const downloadUrl = DOWNLOAD_LINKS[platform as keyof typeof DOWNLOAD_LINKS]
    if (downloadUrl) {
      const link = document.createElement('a')
      link.href = downloadUrl
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      link.click()
    } else {
      addNotification(
        `${platform.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} download not available`,
        'error'
      )
    }
  }

  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const path = location.pathname.split('/').pop()
    if (path && ['profile', 'launcher'].includes(path)) {
      setActiveTab(path as any)
      setFriendsOpen(false)
    }
  }, [location.pathname, setActiveTab])

  if (!user) return null

  return (
    <div className="new-dashboard">
      <Navigation />

      {notifications.length > 0 && (
        <NotificationContainer
          notifications={notifications}
          onClose={removeNotification}
        />
      )}

      {showLogoutModal && (
        <LogoutModal
          isOpen={showLogoutModal}
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}

      {showSoonModal && (
        <SoonModal
          isOpen={showSoonModal}
          title="Soon..."
          message={(t.dashboard as any).soon || "Скоро"}
          onClose={() => setShowSoonModal(false)}
        />
      )}

      <div className="dashboard-wrapper">
        <div className="dashboard-grid">
          {/* Left Column */}
          <div className="dashboard-left">
            {/* Profile Card */}
            <div className="glass-card profile-info-card">
              <div className="profile-main">
                <div className="profile-avatar">
                  <img src={getAvatarUrl(user.avatar)} alt={user.username} />
                </div>
                <div className="profile-text">
                  <h3>
                    {user.profile?.displayName || user.username} <span className="profile-uid">[{user.id}]</span>
                  </h3>
                  <p>{t.dashboard.subscriptionTill}: {user.subscriptionEndDate ? formatDate(user.subscriptionEndDate) : t.dashboard.forever}</p>
                </div>
                <button className="profile-logout-btn" onClick={() => setShowLogoutModal(true)}>
                  <IconLogout size={18} />
                </button>
              </div>
            </div>

            {/* Admin Access Card */}
            {user.isAdmin && (
              <div
                className="glass-card admin-access-card"
                onClick={() => navigate('/admin')}
              >
                <div className="admin-card-content">
                  <IconShield size={24} />
                  <span>{t.dashboard.adminPanel || "Admin Panel"}</span>
                </div>
                <IconArrowRight size={20} />
              </div>
            )}

            {/* License Key Card */}
            <div className="glass-card license-activation-card">
              <span className="card-label">{t.dashboard.activateLicenseKey}</span>
              <div className="license-input-group">
                <div className="input-with-icon">
                  <IconKey size={16} />
                  <input
                    type="text"
                    placeholder={t.dashboard.enterKeyPlaceholder}
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value.toUpperCase())}
                  />
                </div>
                <button className="pink-btn" onClick={handleActivateKey}>
                  <IconCheck size={16} />
                  <span>{t.dashboard.activate}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="dashboard-right">
            {friendsOpen ? (
              <Friends
                user={user}
                t={t}
                onClose={() => setFriendsOpen(false)}
                cachedData={friendsData}
              />
            ) : (
              <>
                {/* Navigation Tabs */}
                <div className="dashboard-nav">
                  <button
                    className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab('profile')
                      navigate('/dashboard/profile')
                    }}
                  >
                    <IconProfile size={16} />
                    <span>{t.dashboard.accountTab}</span>
                  </button>
                  <button
                    className={`nav-tab ${activeTab === 'launcher' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab('launcher')
                      navigate('/dashboard/launcher')
                    }}
                  >
                    <IconDownload size={16} />
                    <span>{t.dashboard.launcherTab}</span>
                  </button>
                </div>

                {/* Tab Content */}
                <div className="tab-content-wrapper">
                  {activeTab === 'profile' && (
                    <div className="account-details-row">
                      <div className="info-box">
                        <div className="info-header">
                          <IconMail size={14} />
                          <span>{t.dashboard.email}</span>
                        </div>
                        <div className="info-text">{user.email}</div>
                      </div>
                      <div className="info-box">
                        <div className="info-header">
                          <IconClock size={14} />
                          <span>{t.dashboard.registration}</span>
                        </div>
                        <div className="info-text">{new Date(user.registeredAt).toLocaleDateString()}</div>
                      </div>
                      <div className="info-box">
                        <div className="info-header">
                          <IconChip size={14} />
                          <span>{t.dashboard.hwid}</span>
                        </div>
                        <div className="info-text">{user.hwid || t.dashboard.notLinked}</div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'launcher' && (
                    <div className="launcher-view">
                      <div className="download-buttons-grid">
                        <div className="download-os-btn windows">
                          <WindowsIcon size={48} />
                          <span>Windows</span>
                          <div className="windows-options">
                            <div className="windows-sub-btn" onClick={() => handleDownloadLauncher('windows_exe')}>
                              <WindowsIcon size={12} className="sub-btn-icon-svg" />
                              <span>EXE Installer</span>
                            </div>
                            <div className="windows-sub-btn" onClick={() => handleDownloadLauncher('windows_msi')}>
                              <WindowsIcon size={12} className="sub-btn-icon-svg" />
                              <span>MSI Installer</span>
                            </div>
                          </div>
                        </div>

                        <div className="download-os-btn macos">
                          <MacIcon size={48} />
                          <span>macOS</span>
                          <div className="macos-options">
                            <div className="macos-sub-btn" onClick={() => handleDownloadLauncher('macos')}>
                              <img src="/intel.png" alt="Intel" className="sub-btn-icon" />
                              <span>Intel</span>
                            </div>
                            <div className="macos-sub-btn" onClick={() => handleDownloadLauncher('macos_arm64')}>
                              <MacIcon size={12} className="apple-silicon-icon" />
                              <span>Apple Silicon</span>
                            </div>
                          </div>
                        </div>

                        <div className="download-os-btn linux">
                          <LinuxIcon size={48} />
                          <span>Linux</span>
                          <div className="linux-options">
                            <div className="linux-sub-btn" onClick={() => handleDownloadLauncher('linux_deb')}>
                              <img src="/debian.png" alt="Debian" className="sub-btn-icon" />
                              <span>Debian</span>
                            </div>
                            <div className="linux-sub-btn" onClick={() => handleDownloadLauncher('linux_rpm')}>
                              <img src="/fedora.png" alt="Fedora" className="sub-btn-icon" />
                              <span>Fedora/RedHat</span>
                            </div>
                            <div className="linux-sub-btn" onClick={() => handleDownloadLauncher('linux_appimage')}>
                              <img src="/appimage.png" alt="AppImage" className="sub-btn-icon" />
                              <span>AppImage</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Cards Row */}
                <div className="bottom-row-grid">
                  <div
                    className="glass-card friends-box-trigger"
                    onClick={() => setFriendsOpen(true)}
                  >
                    <div className="friends-label">
                      <IconProfile size={20} />
                      <span>{t.dashboard.friends}</span>
                    </div>
                    <div className="friends-count">{friendsCount}</div>
                    <div className="friends-value-icon">
                      <IconArrowRight size={24} />
                    </div>
                  </div>
                  <div className="glass-card diagonal-soon-card">
                    <div className="soon-diagonal-text">{t.dashboard.soon}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
