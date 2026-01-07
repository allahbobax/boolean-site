import { useState, useEffect } from 'react'
import Navigation from '../components/Navigation.tsx'
import HeroSection from '../components/HeroSection.tsx'
import FeaturesSection from '../components/FeaturesSection.tsx'
import Footer from '../components/Footer.tsx'
import DecorativeElements from '../components/DecorativeElements.tsx'
import '../styles/home/index.css'
import '../styles/animations/keyframes.css'
import '../styles/animations/effects.css'
import '../styles/animations/hover.css'
import '../styles/animations/scroll.css'
import { getCurrentLanguage, Language } from '../utils/translations/index.ts'

function HomePage() {
  const [lang, setLang] = useState<Language>(getCurrentLanguage())

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
    <div className="home-page">
      <DecorativeElements />
      <Navigation onLanguageChange={handleLanguageChange} />
      <HeroSection lang={lang} />
      <FeaturesSection lang={lang} />
      <Footer lang={lang} />
    </div>
  )
}

export default HomePage
