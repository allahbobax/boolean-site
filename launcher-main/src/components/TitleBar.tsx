import { useState, useRef, useEffect } from 'react'
import { useLanguage, type Language } from '../contexts/LanguageContext'
import '../styles/TitleBar.css'

// SVG Flag Components
const RussianFlag = () => (
  <svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="20" height="15" rx="2" fill="white" />
    <rect y="5" width="20" height="5" fill="#0039A6" />
    <rect y="10" width="20" height="5" fill="#D52B1E" />
  </svg>
)

const BritishFlag = () => (
  <svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="20" height="15" rx="2" fill="#012169" />
    <path d="M0 0L20 15M20 0L0 15" stroke="white" strokeWidth="3" />
    <path d="M0 0L20 15M20 0L0 15" stroke="#C8102E" strokeWidth="2" />
    <path d="M10 0V15M0 7.5H20" stroke="white" strokeWidth="5" />
    <path d="M10 0V15M0 7.5H20" stroke="#C8102E" strokeWidth="3" />
  </svg>
)

const UkrainianFlag = () => (
  <svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="20" height="15" rx="2" fill="#0057B7" />
    <rect y="7.5" width="20" height="7.5" fill="#FFD700" />
  </svg>
)

const PolishFlag = () => (
  <svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="20" height="15" rx="2" fill="white" />
    <rect y="7.5" width="20" height="7.5" fill="#DC143C" />
  </svg>
)

const TurkishFlag = () => (
  <svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="20" height="15" rx="2" fill="#E30A17" />
    <path
      d="M9.4 7.5c0 2.3-1.7 4.1-3.8 4.1S1.8 9.8 1.8 7.5 3.5 3.4 5.6 3.4c1 0 1.9.4 2.6 1.1-.8-.3-1.7-.2-2.5.2-1.6.8-2.2 2.8-1.4 4.4.8 1.6 2.8 2.2 4.4 1.4.5-.2.9-.6 1.3-1.1.1-.3.2-.6.2-1Z"
      fill="white"
      fillRule="evenodd"
      clipRule="evenodd"
    />
    <path d="M12.7 7.5l1.6.5-1 1.3v-1.6l1-.2-1.6.5Z" fill="white" />
  </svg>
)

const KazakhFlag = () => (
  <svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="20" height="15" rx="2" fill="#00AFCA" />
    <circle cx="10" cy="7.5" r="2" fill="#FEC50C" />
  </svg>
)

const LANGUAGES = [
  { code: 'ru' as Language, flag: <RussianFlag />, nameKey: 'lang.russian' },
  { code: 'en' as Language, flag: <BritishFlag />, nameKey: 'lang.english' },
  { code: 'uk' as Language, flag: <UkrainianFlag />, nameKey: 'lang.ukrainian' },
  { code: 'pl' as Language, flag: <PolishFlag />, nameKey: 'lang.polish' },
  { code: 'tr' as Language, flag: <TurkishFlag />, nameKey: 'lang.turkish' },
  { code: 'kk' as Language, flag: <KazakhFlag />, nameKey: 'lang.kazakh' },
]

export default function TitleBar() {
  const { language, setLanguage, t } = useLanguage()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLang = LANGUAGES.find(lang => lang.code === language) || LANGUAGES[0]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  const handleLanguageSelect = (langCode: Language) => {
    setLanguage(langCode)
    setIsDropdownOpen(false)
  }

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
        <div className="language-selector-wrapper" ref={dropdownRef}>
          <div
            className="language-selector"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="language-flag">{currentLang.flag}</span>
            <span className="language-text">{t(currentLang.nameKey)}</span>
            <span className={`language-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
          </div>
          {isDropdownOpen && (
            <div className="language-dropdown">
              {LANGUAGES.map(lang => (
                <div
                  key={lang.code}
                  className={`language-option ${lang.code === language ? 'active' : ''}`}
                  onClick={() => handleLanguageSelect(lang.code)}
                >
                  <span className="language-flag">{lang.flag}</span>
                  <span className="language-text">{t(lang.nameKey)}</span>
                  {lang.code === language && (
                    <svg className="check-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 8L6 11L13 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
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
