import { useState, useEffect } from 'react'

export type Theme = 'dark' | 'light'

export function useTheme(): Theme {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('userSettings')
    if (saved) {
      try {
        return JSON.parse(saved).theme || 'dark'
      } catch {
        return 'dark'
      }
    }
    return 'dark'
  })

  useEffect(() => {
    const handleSettingsChange = (e: CustomEvent) => {
      if (e.detail?.theme) {
        setTheme(e.detail.theme)
      }
    }

    const handleStorageChange = () => {
      const saved = localStorage.getItem('userSettings')
      if (saved) {
        try {
          const settings = JSON.parse(saved)
          setTheme(settings.theme || 'dark')
        } catch {
          // ignore
        }
      }
    }

    window.addEventListener('userSettingsChanged', handleSettingsChange as EventListener)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('userSettingsChanged', handleSettingsChange as EventListener)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  return theme
}
