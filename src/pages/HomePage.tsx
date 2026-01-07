import { useState, useEffect } from 'react'
import Navigation from '../components/Navigation.tsx'
import HeroSection from '../components/HeroSection.tsx'
import FeaturesSection from '../components/FeaturesSection.tsx'
import Footer from '../components/Footer.tsx'
import DecorativeElements from '../components/DecorativeElements.tsx'
import '../styles/home/index.css'
import { getCurrentLanguage, Language } from '../utils/translations/index.ts'
import { useTheme } from '../hooks/useTheme'

function HomePage() {
  const [lang, setLang] = useState<Language>(getCurrentLanguage())
  const theme = useTheme()
  const isDark = theme !== 'light'

  useEffect(() => {
    const handleStorageChange = () => {
      setLang(getCurrentLanguage())
    }
    window.addEventListener('storage', handleStorageChange)

    const interval = setInterval(() => {
      const newLang = getCurrentLanguage()
      if (newLang !== lang) {
        setLang(newLang)
      }
    }, 100)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [lang])

  const handleLanguageChange = () => {
    setLang(getCurrentLanguage())
  }

  return (
    <div className={`min-h-screen relative overflow-x-hidden ${isDark ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
      <DecorativeElements />
      <Navigation onLanguageChange={handleLanguageChange} />
      <HeroSection lang={lang} />
      <FeaturesSection lang={lang} />
      <Footer lang={lang} />
    </div>
  )
}

export default HomePage
