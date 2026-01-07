import { useState, useEffect, useRef } from 'react'
import 'flag-icons/css/flag-icons.min.css'
import { LANGUAGES } from '../utils/constants'
import { Language } from '../utils/translations/index'
import { useTheme } from '../hooks/useTheme'

interface LanguageSelectorProps {
  onLanguageChange?: (lang: Language) => void
  dropdownDirection?: 'up' | 'down'
}

function LanguageSelector({ onLanguageChange, dropdownDirection = 'down' }: LanguageSelectorProps) {
  const [currentLang, setCurrentLang] = useState('ru')
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [actualDirection, setActualDirection] = useState<'up' | 'down'>(dropdownDirection)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const theme = useTheme()
  const isDark = theme !== 'light'

  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ru'
    setCurrentLang(savedLang)
  }, [])

  useEffect(() => {
    // На мобильных устройствах всегда открываем вверх
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 900
      if (isMobileDevice) {
        setActualDirection('up')
      } else {
        setActualDirection(dropdownDirection)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [dropdownDirection])

  const changeLanguage = (lang: string) => {
    const typedLang = lang as Language
    setCurrentLang(typedLang)
    localStorage.setItem('language', lang)
    setShowLangMenu(false)
    onLanguageChange?.(typedLang)
  }

  return (
    <div className="relative ml-1">
      <button 
        ref={toggleRef}
        className={`flex items-center gap-1.5 rounded-3xl py-1 px-3 text-sm cursor-pointer transition-all duration-200
          ${isDark 
            ? 'bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white' 
            : 'bg-black/5 border border-black/10 text-gray-600 hover:bg-black/10 hover:text-gray-900'
          }`}
        onClick={(e) => { e.stopPropagation(); setShowLangMenu(!showLangMenu); }}
      >
        <span className={`fi fi-${LANGUAGES[currentLang as keyof typeof LANGUAGES].flagCode} text-base leading-none`}></span>
        <span>{currentLang.toUpperCase()}</span>
      </button>

      {showLangMenu && (
        <div 
          className={`absolute right-0 p-2 min-w-[160px] z-[1000] rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.3)]
            ${actualDirection === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'}
            ${isDark 
              ? 'bg-[rgba(10,10,10,0.95)] backdrop-blur-[20px] border border-white/10' 
              : 'bg-[rgba(255,255,255,0.95)] backdrop-blur-[20px] border border-black/10 shadow-[0_4px_20px_rgba(0,0,0,0.15)]'
            }`}
        >
          {Object.entries(LANGUAGES).map(([code, lang]) => (
            <button
              key={code}
              className={`flex items-center gap-2 w-full py-2 px-3 bg-transparent border-none text-left cursor-pointer rounded-xl transition-all duration-200 text-sm
                ${currentLang === code 
                  ? (isDark ? 'bg-white/5 text-white' : 'bg-black/5 text-gray-900')
                  : (isDark ? 'text-zinc-400 hover:bg-white/5 hover:text-white' : 'text-gray-600 hover:bg-black/5 hover:text-gray-900')
                }`}
              onClick={(e) => { e.stopPropagation(); changeLanguage(code); }}
            >
              <span className={`fi fi-${lang.flagCode} text-lg`}></span>
              <span className="flex-grow">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSelector
