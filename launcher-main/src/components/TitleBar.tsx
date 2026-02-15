import { useLanguage } from '../contexts/LanguageContext'
import '../styles/TitleBar.css'

export default function TitleBar() {
  const { t } = useLanguage()

  const handleMinimize = async () => {
    try {
      if (window.electron?.minimize) {
        await window.electron.minimize()
      }
    } catch (error) {
      // Error minimizing window
    }
  }

  const handleClose = async () => {
    try {
      if (window.electron?.close) {
        await window.electron.close()
      }
    } catch (error) {
      // Error closing window
    }
  }

  return (
    <div className="titlebar" data-tauri-drag-region>
      <div className="titlebar-left" data-tauri-drag-region>
        <div className="app-logo">BOOLEAN</div>
      </div>
      <div className="titlebar-right">
        <button className="title-btn" onClick={handleMinimize} title={t('titlebar.minimize')}>
          <svg width="12" height="2" viewBox="0 0 12 2" fill="currentColor">
            <rect width="12" height="2" rx="1" />
          </svg>
        </button>
        <button className="title-btn close-btn" onClick={handleClose} title={t('titlebar.close')}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M11 1L1 11M1 1L11 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
