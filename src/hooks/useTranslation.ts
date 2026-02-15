import { useState, useCallback, useEffect } from 'react'
import { getTranslation, getCurrentLanguage, setCurrentLanguage, getDateLocale, type Language, type TranslationStructure } from '../utils/translations/index'

export function useTranslation() {
  const [lang, setLang] = useState<Language>(getCurrentLanguage())
  const [t, setT] = useState<TranslationStructure>(getTranslation(lang))
  const [dateLocale, setDateLocale] = useState<string>(getDateLocale(lang))

  const changeLang = useCallback((newLang: Language) => {
    setCurrentLanguage(newLang)
    setLang(newLang)
    setT(getTranslation(newLang))
    setDateLocale(getDateLocale(newLang))
  }, [])

  // Синхронизация при изменении в других вкладках
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'language') {
        const newLang = getCurrentLanguage()
        setLang(newLang)
        setT(getTranslation(newLang))
        setDateLocale(getDateLocale(newLang))
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return { t, lang, changeLang, dateLocale }
}
