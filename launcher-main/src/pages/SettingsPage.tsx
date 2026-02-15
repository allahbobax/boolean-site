import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import '../styles/SettingsPage.css'

export default function SettingsPage() {
  const { t } = useLanguage()

  const [ramMb, setRamMb] = useState(4096)
  const [folderPath, setFolderPath] = useState('C:/BooleanClient')
  const [windowWidth, setWindowWidth] = useState(925)
  const [windowHeight, setWindowHeight] = useState(530)
  const [fullscreen, setFullscreen] = useState(false)
  const [reinstallClient, setReinstallClient] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const [wipeInProgress, setWipeInProgress] = useState(false)
  const [wipeStatus, setWipeStatus] = useState<string | null>(null)

  useEffect(() => {
    const savedSettings = localStorage.getItem('settings')
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        setRamMb(settings.ramAllocation || 4096)
        setFolderPath(settings.installPath || 'C:/BooleanClient')
        setWindowWidth(settings.windowWidth || 925)
        setWindowHeight(settings.windowHeight || 530)
        setFullscreen(settings.fullscreen || false)
        setDebugMode(settings.debugMode || false)
      } catch (e) {
        // Failed to load settings
      }
    }
  }, [])

  useEffect(() => {
    const settings = {
      ramAllocation: ramMb,
      installPath: folderPath,
      windowWidth,
      windowHeight,
      fullscreen,
      reinstallClient,
      debugMode
    }
    localStorage.setItem('settings', JSON.stringify(settings))
  }, [ramMb, folderPath, windowWidth, windowHeight, fullscreen, reinstallClient, debugMode])

  const handleBrowseFolder = async () => {
    if (!window.electron) return
    try {
      const result = await window.electron.selectFolder()
      if (result) {
        setFolderPath(result)
      }
    } catch (error) {
      // Failed to select folder
    }
  }

  const handleOpenFolder = async () => {
    if (!window.electron) return
    try {
      await (window.electron as any).openFolderPath(folderPath)
    } catch (error) {
      // Failed to open folder
    }
  }

  const handleRefreshPath = () => {
    setFolderPath('C:/BooleanClient')
  }

  const handleWipeAll = async () => {
    if (!window.electron || wipeInProgress) return

    const first = window.confirm(t('settings.wipe_confirm_1'))
    if (!first) return

    setWipeInProgress(true)
    setWipeStatus(null)
    try {
      const result = await window.electron?.wipeClientData()
      if (!result) {
        setWipeStatus(t('settings.wipe_error'))
        return
      }
      if (!result.success) {
        setWipeStatus(`${t('settings.wipe_error')}: ${result.errors.join('; ')}`)
      }
    } catch (e: any) {
      setWipeStatus(`${t('settings.wipe_error')}: ${String(e?.message || e)}`)
    } finally {
      setWipeInProgress(false)
    }
  }

  return (
    <div className="page settings-page">
      <div className="settings-grid">
        {/* RAM Settings */}
        <div className="settings-card">
          <h3 className="settings-card-title">{t('settings.ram')}</h3>
          <p className="settings-card-description">
            {t('settings.ram_desc')}
          </p>
          <div className="ram-control">
            <input
              type="range"
              className="ram-slider"
              min="2048"
              max="16384"
              step="1024"
              value={ramMb}
              onChange={(e) => setRamMb(Number(e.target.value))}
            />
            <div className="ram-display">
              <span className="ram-value">{ramMb / 1024} GB</span>
            </div>
          </div>
        </div>

        {/* Location Settings */}
        <div className="settings-card">
          <h3 className="settings-card-title">{t('settings.location')}</h3>
          <p className="settings-card-description">
            {t('settings.location_desc')}
          </p>
          <div className="folder-control">
            <input
              type="text"
              className="folder-input"
              value={folderPath}
              readOnly
              placeholder={t('settings.folder')}
            />
            <button className="folder-btn" onClick={handleRefreshPath} title={t('settings.reset')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 4V10H7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M23 20V14H17" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className="folder-btn" onClick={handleOpenFolder} title={t('settings.open_folder')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className="folder-btn" onClick={handleBrowseFolder} title={t('settings.change')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Window Size Settings */}
        <div className="settings-card">
          <h3 className="settings-card-title">{t('settings.window')}</h3>
          <p className="settings-card-description">
            {t('settings.window_desc')}
          </p>
          <div className="window-labels">
            <span className="window-label">{t('settings.width')}</span>
            <span className="window-label" style={{ marginLeft: '24px' }}>{t('settings.height')}</span>
          </div>
          <div className="window-control">
            <input
              type="number"
              className="window-input"
              value={windowWidth}
              onChange={(e) => setWindowWidth(Number(e.target.value))}
            />
            <span className="window-separator">×</span>
            <input
              type="number"
              className="window-input"
              value={windowHeight}
              onChange={(e) => setWindowHeight(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Other Settings */}
        <div className="settings-card">
          <h3 className="settings-card-title">{t('settings.other')}</h3>
          <div className="toggles-list">
            <div className="toggle-item">
              <div className="toggle-info">
                <svg className="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                <span className="toggle-label">{t('settings.fullscreen')}</span>
              </div>
              <span className="toggle-status">{fullscreen ? t('settings.on') : t('settings.off')}</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={fullscreen}
                  onChange={(e) => setFullscreen(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <svg className="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 2L3 10L10 13L13 20L21 2Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="toggle-label">{t('settings.reinstall')}</span>
              </div>
              <span className="toggle-status">{reinstallClient ? t('settings.on') : t('settings.off')}</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={reinstallClient}
                  onChange={(e) => setReinstallClient(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <svg className="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C10.0222 2 8.08879 2.58649 6.4443 3.6853C4.79981 4.78412 3.51809 6.3459 2.76121 8.17317C2.00433 10.0004 1.8063 12.0111 2.19215 13.9509C2.578 15.8907 3.53041 17.6725 4.92893 19.0711C6.32746 20.4696 8.10929 21.422 10.0491 21.8079C11.9889 22.1937 13.9996 21.9957 15.8268 21.2388C17.6541 20.4819 19.2159 19.2002 20.3147 17.5557C21.4135 15.9112 22 13.9778 22 12" />
                  <path d="M22 4L12 14.01L9 11.01" />
                </svg>
                <span className="toggle-label">{t('settings.debug')}</span>
              </div>
              <span className="toggle-status">{debugMode ? t('settings.on') : t('settings.off')}</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={debugMode}
                  onChange={(e) => setDebugMode(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="danger-zone">
            <button
              className="danger-btn"
              onClick={handleWipeAll}
              disabled={wipeInProgress}
            >
              {wipeInProgress ? t('settings.wipe_in_progress') : t('settings.wipe_all')}
            </button>
            {wipeStatus && <div className="danger-status">{wipeStatus}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
