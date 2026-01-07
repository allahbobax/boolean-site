import { useState, useEffect, useCallback } from 'react'
import { getTranslation, getCurrentLanguage, getDateLocale, type Language, type TranslationStructure } from '../utils/translations/index'

export function useTranslation() {
  const [lang, setLang] = useState<Language>(getCurrentLanguage())
  const [t, setT] = useState<TranslationStructure>(getTranslation(lang))
  const [dateLocale, setDateLocale] = useState<string>(getDateLocale(lang))

  useEffect(() => {
    const handleStorageChange = () => {
      const newLang = getCurrentLanguage()
      setLang(newLang)
      setT(getTranslation(newLang))
      setDateLocale(getDateLocale(newLang))
    }

    // Слушаем изменения в localStorage
    window.addEventListener('storage', handleStorageChange)
    
    // Также проверяем периодически для изменений в той же вкладке
    const interval = setInterval(() => {
      const currentLang = getCurrentLanguage()
      if (currentLang !== lang) {
        setLang(currentLang)
        setT(getTranslation(currentLang))
        setDateLocale(getDateLocale(currentLang))
      }
    }, 100)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [lang])

  const changeLang = useCallback((newLang: Language) => {
    localStorage.setItem('language', newLang)
    setLang(newLang)
    setT(getTranslation(newLang))
    setDateLocale(getDateLocale(newLang))
  }, [])

  return { t, lang, changeLang, dateLocale }
}
