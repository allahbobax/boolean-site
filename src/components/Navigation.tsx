import { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import LanguageSelector from './ThemeLanguageSelector'
import { getCurrentUser } from '../utils/database'
import { getAvatarUrl } from '../utils/avatarGenerator'
import { IconHome, IconSun, IconTeam } from './icons/NavigationIcons'
import { MoonIcon } from './icons/MoonIcon'
import { IconShoppingBag } from './icons/UIIcons'
import { IconShield, IconDocument } from './icons/DashboardIcons'
import { Language } from '../utils/translations/index'

// Static version of IconChecklist for navigation (no animations)
const IconChecklistStatic: React.FC<{ size?: number; className?: string }> = ({ size = 24, className }) => (
  <svg
    className={className || ''}
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="8" y="6" width="32" height="36" rx="2" strokeOpacity="0.8" />
    <path d="M16 14H32" />
    <path d="M16 22H32" />
    <path d="M16 30H26" />
  </svg>
)

interface NavigationProps {
  onLanguageChange: (lang: Language) => void
}

export default function Navigation({ onLanguageChange }: NavigationProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [settings, setSettings] = useState({
    snowEnabled: true,
    theme: 'dark'
  })

  // Swipe gesture state
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50

  useEffect(() => {
    const updateAuth = () => {
      const user = getCurrentUser()
      setCurrentUser(user)
    }

    // Load settings
    const saved = localStorage.getItem('userSettings')
    if (saved) {
      const parsedSettings = JSON.parse(saved)
      setSettings(parsedSettings)
      document.body.setAttribute('data-theme', parsedSettings.theme)
    }

    updateAuth()
    window.addEventListener('storage', updateAuth)
    window.addEventListener('currentUserChanged', updateAuth)

    return () => {
      window.removeEventListener('storage', updateAuth)
      window.removeEventListener('currentUserChanged', updateAuth)
    }
  }, [])

  // Swipe gesture handlers
  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      setTouchEnd(null)
      setTouchStart(e.targetTouches[0].clientX)
    }

    const onTouchMove = (e: TouchEvent) => {
      setTouchEnd(e.targetTouches[0].clientX)
    }

    const onTouchEnd = () => {
      if (!touchStart || !touchEnd) return
      
      const distance = touchEnd - touchStart
      const isLeftSwipe = distance < -minSwipeDistance
      const isRightSwipe = distance > minSwipeDistance
      
      // Open menu on right swipe from left edge (within 50px from left)
      if (isRightSwipe && touchStart < 50 && !mobileMenuOpen) {
        setMobileMenuOpen(true)
      }
      
      // Close menu on left swipe when menu is open
      if (isLeftSwipe && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('touchstart', onTouchStart)
    document.addEventListener('touchmove', onTouchMove)
    document.addEventListener('touchend', onTouchEnd)

    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [touchStart, touchEnd, mobileMenuOpen])

  const updateSettings = (newSettings: typeof settings) => {
    setSettings(newSettings)
    localStorage.setItem('userSettings', JSON.stringify(newSettings))
    document.body.setAttribute('data-theme', newSettings.theme)

    // Dispatch custom event to notify Snowfall component
    window.dispatchEvent(new CustomEvent('userSettingsChanged', { detail: newSettings }))
  }

  const toggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark'
    updateSettings({ ...settings, theme: newTheme })
  }

  const handleNavClick = (path: string) => {
    navigate(path)
    setMobileMenuOpen(false)
  }

  return (
    <>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-nav-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <div className={`mobile-nav-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-header">
          <h3>Menu</h3>
        </div>

        {/* User Profile Section in Sidebar */}
        <div className="mobile-nav-user">
          {currentUser ? (
            <button onClick={() => handleNavClick('/dashboard')} className="mobile-user-profile">
              <img
                src={getAvatarUrl(currentUser.avatar)}
                alt="Avatar"
                className="mobile-user-avatar"
              />
              <div className="mobile-user-info">
                <span className="mobile-user-name">{currentUser.username}</span>
                <span className="mobile-user-status">View Dashboard</span>
              </div>
            </button>
          ) : (
            <div className="mobile-auth-buttons">
              <button onClick={() => handleNavClick('/login')} className="mobile-signin-btn">Sign In</button>
              <button onClick={() => handleNavClick('/register')} className="mobile-signup-btn">Sign Up</button>
            </div>
          )}
        </div>
        
        <div className="mobile-nav-links">
          <button onClick={() => handleNavClick('/')} className={`mobile-nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <IconHome size={20} />
            <span>Home</span>
          </button>
          <button onClick={() => handleNavClick('/dev-team')} className={`mobile-nav-link ${location.pathname === '/dev-team' ? 'active' : ''}`}>
            <IconTeam size={20} />
            <span>Dev Team</span>
          </button>
          <button onClick={() => handleNavClick('/pricing')} className={`mobile-nav-link ${location.pathname === '/pricing' ? 'active' : ''}`}>
            <IconShoppingBag size={20} />
            <span>Products</span>
          </button>
          <button onClick={() => handleNavClick('/personal-data')} className={`mobile-nav-link ${location.pathname === '/personal-data' ? 'active' : ''}`}>
            <IconShield size={20} />
            <span>Privacy Policy</span>
          </button>
          <button onClick={() => handleNavClick('/user-agreement')} className={`mobile-nav-link ${location.pathname === '/user-agreement' ? 'active' : ''}`}>
            <IconDocument size={20} />
            <span>Terms of Service</span>
          </button>
          <button onClick={() => handleNavClick('/usage-rules')} className={`mobile-nav-link ${location.pathname === '/usage-rules' ? 'active' : ''}`}>
            <IconChecklistStatic size={20} />
            <span>Usage Rules</span>
          </button>
        </div>

        <div className="mobile-nav-footer">
          <div className="mobile-nav-language">
            <LanguageSelector onLanguageChange={onLanguageChange} dropdownDirection="up" />
          </div>
          <div className="mobile-nav-theme-toggle">
            <button onClick={toggleTheme} className="mobile-theme-btn">
              {settings.theme === 'dark' ? <IconSun size={20} /> : <MoonIcon size={20} />}
              <span>{settings.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>
      </div>

      <nav className="navbar-pill-container">
        <div className="navbar-pill">
          {/* Burger Button - Mobile Only */}
          <button className="mobile-burger-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className="nav-links-centered">
            <Link to="/" className={`nav-link-pill ${location.pathname === '/' ? 'active' : ''}`}>
              <IconHome size={16} />
              <span>Home</span>
            </Link>
            <button onClick={() => navigate('/dev-team')} className={`nav-link-pill ${location.pathname === '/dev-team' ? 'active' : ''}`}>
              <IconTeam size={16} />
              <span>Dev Team</span>
            </button>
            <button onClick={() => navigate('/pricing')} className={`nav-link-pill ${location.pathname === '/pricing' ? 'active' : ''}`}>
              <IconShoppingBag size={16} />
              <span>Products</span>
            </button>
            <button onClick={() => navigate('/personal-data')} className={`nav-link-pill ${location.pathname === '/personal-data' ? 'active' : ''}`}>
              <IconShield size={16} />
              <span>Privacy Policy</span>
            </button>
            <button onClick={() => navigate('/user-agreement')} className={`nav-link-pill ${location.pathname === '/user-agreement' ? 'active' : ''}`}>
              <IconDocument size={16} />
              <span>Terms of Service</span>
            </button>
            <button onClick={() => navigate('/usage-rules')} className={`nav-link-pill ${location.pathname === '/usage-rules' ? 'active' : ''}`}>
              <IconChecklistStatic size={16} />
              <span>Usage Rules</span>
            </button>
          </div>

        <div className="nav-right nav-right-desktop-only">
          <div className="nav-toggles">
            <button
              onClick={toggleTheme}
              className="nav-icon-btn"
              title={settings.theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {settings.theme === 'dark' ? <IconSun size={18} /> : <MoonIcon size={18} />}
            </button>
            <button
              onClick={() => {
                const event = new KeyboardEvent('keydown', {
                  key: '/',
                  ctrlKey: true,
                  bubbles: true
                })
                window.dispatchEvent(event)
              }}
              className="nav-icon-btn nav-keyboard-btn"
              title="Keyboard Shortcuts (Ctrl+/)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/>
              </svg>
            </button>
          </div>

          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <LanguageSelector onLanguageChange={onLanguageChange} />
              <div className="nav-user-divider"></div>
              <button onClick={() => navigate('/dashboard')} className="nav-signin-pill" style={{ padding: '0.5rem 0.75rem' }}>
                <img
                  src={getAvatarUrl(currentUser.avatar)}
                  alt="Avatar"
                  className="nav-avatar-pill"
                />
                <span>{currentUser.username}</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <LanguageSelector onLanguageChange={onLanguageChange} />
              <div className="nav-user-divider"></div>
              <button onClick={() => navigate('/login')} className="nav-signin-pill" style={{ padding: '0.5rem 0.75rem' }}>Sign In</button>
              <button onClick={() => navigate('/register')} className="nav-signup-pill" style={{ padding: '0.5rem 1.25rem' }}>Sign Up</button>
            </div>
          )}
        </div>
      </div>
    </nav>
    </>
  )
}
