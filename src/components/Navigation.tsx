import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { getCurrentUser } from '../utils/database'
import { getAvatarUrl } from '../utils/avatarGenerator'
import { IconHome, IconSun, IconTeam } from './icons/NavigationIcons'
import { MoonIcon } from './icons/MoonIcon'
import { IconShoppingBag } from './icons/UIIcons'
import { IconShield, IconDocument } from './icons/DashboardIcons'

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
}

export default function Navigation({ }: NavigationProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [settings, setSettings] = useState({
    snowEnabled: true,
    theme: 'dark'
  })

  const [, setTouchStart] = useState<number | null>(null)
  const [, setTouchEnd] = useState<number | null>(null)
  const minSwipeDistance = 50

  useEffect(() => {
    const updateAuth = () => {
      const user = getCurrentUser()
      setCurrentUser(user)
    }

    const saved = localStorage.getItem('userSettings')
    if (saved) {
      const parsedSettings = JSON.parse(saved)
      setSettings(parsedSettings)
      document.documentElement.setAttribute('data-theme', parsedSettings.theme)
    }

    updateAuth()
    window.addEventListener('storage', updateAuth)
    window.addEventListener('currentUserChanged', updateAuth)

    return () => {
      window.removeEventListener('storage', updateAuth)
      window.removeEventListener('currentUserChanged', updateAuth)
    }
  }, [])

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      setTouchEnd(null)
      setTouchStart(e.targetTouches[0].clientX)
    }

    const onTouchMove = (e: TouchEvent) => {
      setTouchEnd(e.targetTouches[0].clientX)
    }

    const onTouchEnd = () => {
      setTouchStart(prev => {
        setTouchEnd(prevEnd => {
          if (!prev || !prevEnd) return prevEnd
          
          const distance = prevEnd - prev
          const isLeftSwipe = distance < -minSwipeDistance
          const isRightSwipe = distance > minSwipeDistance
          
          if (isRightSwipe && prev < 50 && !mobileMenuOpen) {
            setMobileMenuOpen(true)
          }
          
          if (isLeftSwipe && mobileMenuOpen) {
            setMobileMenuOpen(false)
          }
          
          return prevEnd
        })
        return prev
      })
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  const updateSettings = (newSettings: typeof settings) => {
    setSettings(newSettings)
    localStorage.setItem('userSettings', JSON.stringify(newSettings))
    document.documentElement.setAttribute('data-theme', newSettings.theme)
    window.dispatchEvent(new CustomEvent('userSettingsChanged', { detail: newSettings }))
  }

  const isDark = settings.theme === 'dark'

  const toggleTheme = (event?: React.MouseEvent) => {
    const isAppearanceTransition = 
      // @ts-ignore
      document.startViewTransition &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!isAppearanceTransition || !event) {
      const newTheme = settings.theme === 'dark' ? 'light' : 'dark'
      updateSettings({ ...settings, theme: newTheme })
      return
    }

    const newTheme = settings.theme === 'dark' ? 'light' : 'dark'
    
    // Светлая тема идет из нижнего левого угла, темная - от кнопки
    const x = newTheme === 'light' ? 0 : event.clientX
    const y = newTheme === 'light' ? window.innerHeight : event.clientY
    
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    // @ts-ignore
    const transition = document.startViewTransition(() => {
      flushSync(() => {
        updateSettings({ ...settings, theme: newTheme })
      })
    })

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ]
      
      document.documentElement.animate(
        {
          clipPath: newTheme === 'dark' ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 500,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: newTheme === 'dark' ? '::view-transition-old(root)' : '::view-transition-new(root)',
        }
      )
    })
  }

  const handleNavClick = (path: string) => {
    navigate(path)
    setMobileMenuOpen(false)
  }

  return (
    <>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[998] animate-[fadeIn_0.3s_ease] max-[900px]:block hidden"
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed top-0 left-0 bottom-0 w-[280px] z-[999] flex-col p-0 overflow-y-auto transition-transform duration-300 hidden max-[900px]:flex
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isDark 
          ? 'bg-[rgba(10,10,10,0.98)] backdrop-blur-[20px] border-r border-white/10' 
          : 'bg-[rgba(255,255,255,0.98)] backdrop-blur-[20px] border-r border-black/10'
        }`}>
        <div className={`flex items-center justify-start p-6 border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
          <h3 className={`m-0 text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Menu</h3>
        </div>

        {/* User Profile Section */}
        <div className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
          {currentUser ? (
            <button 
              onClick={() => handleNavClick('/dashboard')} 
              className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 w-full
                ${isDark 
                  ? 'bg-white/5 border border-white/10 hover:bg-white/10' 
                  : 'bg-black/[0.03] border border-black/10 hover:bg-black/5'
                }`}
            >
              <img src={getAvatarUrl(currentUser.avatar)} alt="Avatar" className="w-10 h-10 rounded-[10px] object-cover" />
              <div className="flex flex-col items-start flex-1">
                <span className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentUser.username}</span>
                <span className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>View Dashboard</span>
              </div>
            </button>
          ) : (
            <div className="flex gap-2 w-full">
              <button 
                onClick={() => handleNavClick('/auth')} 
                className={`w-full py-3.5 border rounded-xl text-[0.95rem] font-semibold cursor-pointer transition-all duration-200
                  ${isDark 
                    ? 'bg-white text-black hover:bg-gray-100' 
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
              >
                Sign In
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col p-4 gap-1">
          {[
            { path: '/', icon: <IconHome size={20} />, label: 'Home' },
            { path: '/dev-team', icon: <IconTeam size={20} />, label: 'Dev Team' },
            { path: '/pricing', icon: <IconShoppingBag size={20} />, label: 'Products' },
            { path: '/personal-data', icon: <IconShield size={20} />, label: 'Privacy Policy' },
            { path: '/user-agreement', icon: <IconDocument size={20} />, label: 'Terms of Service' },
            { path: '/usage-rules', icon: <IconChecklistStatic size={20} />, label: 'Usage Rules' },
          ].map(({ path, icon, label }) => (
            <button 
              key={path}
              onClick={() => handleNavClick(path)} 
              className={`flex items-center gap-3 p-4 bg-transparent border-none text-base font-medium text-left cursor-pointer rounded-xl transition-all duration-200 w-full
                ${location.pathname === path 
                  ? (isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-gray-900')
                  : (isDark ? 'text-zinc-400 hover:bg-white/5 hover:text-white' : 'text-gray-500 hover:bg-black/5 hover:text-gray-900')
                }`}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}

          {/* Theme Toggle */}
          <button 
            onClick={(e) => toggleTheme(e)} 
            className={`flex items-center gap-3 p-4 bg-transparent border-none text-base font-medium text-left cursor-pointer rounded-xl transition-all duration-200 w-full
              ${isDark ? 'text-zinc-400 hover:bg-white/5 hover:text-white' : 'text-gray-500 hover:bg-black/5 hover:text-gray-900'}`}
          >
            {isDark ? <IconSun size={20} /> : <MoonIcon size={20} />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {/* Logout Button */}
          {currentUser && (
            <button 
              onClick={() => {
                localStorage.removeItem('currentUser')
                setCurrentUser(null)
                window.dispatchEvent(new Event('currentUserChanged'))
                setMobileMenuOpen(false)
                navigate('/')
              }} 
              className={`flex items-center gap-3 p-4 bg-transparent border-none text-base font-medium text-left cursor-pointer rounded-xl transition-all duration-200 w-full
                ${isDark 
                  ? 'text-red-400 hover:bg-red-500/10' 
                  : 'text-red-600 hover:bg-red-50'
                }`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className={`fixed top-6 left-0 right-0 z-[1000] flex justify-center pointer-events-none transition-all duration-300
        ${mobileMenuOpen ? 'max-[900px]:opacity-0 max-[900px]:pointer-events-none' : ''}`}>
        <div className={`pointer-events-auto flex items-center justify-between backdrop-blur-[20px] py-2 pr-2 pl-6 rounded-[120px] min-w-[800px] shadow-[0_10px_30px_rgba(0,0,0,0.5)]
          max-[900px]:min-w-auto max-[900px]:px-3 max-[900px]:py-1.5 max-[900px]:justify-between max-[900px]:gap-2
          max-[480px]:min-w-0 max-[480px]:px-2 max-[480px]:py-1 max-[480px]:justify-center
          ${isDark 
            ? 'bg-[rgba(10,10,10,0.4)] border border-white/10' 
            : 'bg-[rgba(255,255,255,0.85)] border border-black/10 shadow-[0_10px_30px_rgba(0,0,0,0.1)]'
          }`}>
          
          {/* Burger Button - Mobile Only */}
          <button 
            className="hidden max-[900px]:flex flex-col justify-between w-6 h-4 bg-transparent border-none cursor-pointer p-0 max-[480px]:w-5 max-[480px]:h-3.5"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className={`block w-full h-0.5 rounded-sm transition-all duration-300 ${isDark ? 'bg-white' : 'bg-gray-900'}`}></span>
            <span className={`block w-full h-0.5 rounded-sm transition-all duration-300 ${isDark ? 'bg-white' : 'bg-gray-900'}`}></span>
            <span className={`block w-full h-0.5 rounded-sm transition-all duration-300 ${isDark ? 'bg-white' : 'bg-gray-900'}`}></span>
          </button>

          {/* Desktop Nav Links */}
          <div className="flex items-center gap-2 max-[900px]:hidden">
            {[
              { path: '/', icon: <IconHome size={16} />, label: 'Home', isLink: true },
              { path: '/dev-team', icon: <IconTeam size={16} />, label: 'Dev Team' },
              { path: '/pricing', icon: <IconShoppingBag size={16} />, label: 'Products' },
              { path: '/personal-data', icon: <IconShield size={16} />, label: 'Privacy Policy' },
              { path: '/user-agreement', icon: <IconDocument size={16} />, label: 'Terms of Service' },
              { path: '/usage-rules', icon: <IconChecklistStatic size={16} />, label: 'Usage Rules' },
            ].map(({ path, icon, label, isLink }) => {
              const baseClasses = `bg-transparent border-none text-[0.95rem] font-medium no-underline cursor-pointer transition-all duration-300 py-2 px-3 rounded-[60px] flex items-center gap-2
                ${location.pathname === path 
                  ? (isDark ? 'text-white bg-white/5' : 'text-gray-900 bg-black/5')
                  : (isDark ? 'text-zinc-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-black/5')
                }`
              
              return isLink ? (
                <Link key={path} to={path} className={baseClasses}>
                  {icon}
                  <span>{label}</span>
                </Link>
              ) : (
                <button key={path} onClick={() => navigate(path)} className={baseClasses}>
                  {icon}
                  <span>{label}</span>
                </button>
              )
            })}
          </div>

          {/* Right Side - Desktop Only */}
          <div className="flex items-center gap-2 max-[900px]:hidden">
            <div className="flex gap-1 mr-2 items-center max-[480px]:gap-0.5 max-[480px]:mr-0.5">
              <button
                onClick={(e) => toggleTheme(e)}
                className={`p-2 rounded-full bg-transparent border-none cursor-pointer flex items-center justify-center transition-all duration-200
                  ${isDark ? 'text-zinc-400 hover:text-white hover:bg-white/10' : 'text-gray-700 hover:text-gray-900 hover:bg-black/10'}`}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? <IconSun size={18} /> : <MoonIcon size={18} />}
              </button>
            </div>

            {currentUser ? (
              <div className="flex items-center gap-1">
                <div className={`w-px h-6 mx-1 ${isDark ? 'bg-white/10' : 'bg-black/10'}`}></div>
                <button 
                  onClick={() => navigate('/dashboard')} 
                  className={`bg-transparent border-none py-2 px-3 text-[0.95rem] font-semibold cursor-pointer transition-all duration-300 rounded-[60px] flex items-center gap-2 h-9
                    ${isDark ? 'text-white hover:bg-white/5' : 'text-gray-900 hover:bg-black/5'}`}
                >
                  <img src={getAvatarUrl(currentUser.avatar)} alt="Avatar" className="w-6 h-6 rounded-full object-cover m-0 shrink-0" />
                  <span>{currentUser.username}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <div className={`w-px h-6 mx-1 ${isDark ? 'bg-white/10' : 'bg-black/10'}`}></div>
                <button 
                  onClick={() => navigate('/auth')} 
                  className={`border-none py-3 px-7 text-[0.95rem] font-bold cursor-pointer transition-all duration-300 rounded-[60px] shadow-[0_2px_8px_rgba(0,0,0,0.15)]
                    max-[900px]:text-[0.85rem] max-[900px]:py-2 max-[900px]:px-3
                    ${isDark ? 'bg-white text-black' : 'bg-gray-900 text-white'}`}
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
