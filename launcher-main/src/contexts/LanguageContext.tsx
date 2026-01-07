import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'


export type Language = 'ru' | 'en' | 'uk' | 'pl' | 'tr' | 'kk'

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
    children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
    const [language, setLanguageState] = useState<Language>(() => {
        const saved = localStorage.getItem('language')
        return (saved === 'en' || saved === 'ru' || saved === 'uk' || saved === 'pl' || saved === 'tr' || saved === 'kk') ? saved : 'ru'
    })

    const [translations, setTranslations] = useState<Record<string, string>>({})

    useEffect(() => {
        const loadTranslations = async () => {
            try {
                const module = await import(`../locales/${language}.ts`)
                setTranslations(module.default)
            } catch (error) {
                // Failed to load translations
            }
        }
        loadTranslations()
    }, [language])

    const setLanguage = (lang: Language) => {
        setLanguageState(lang)
        localStorage.setItem('language', lang)
    }

    const t = (key: string): string => {
        return translations[key] || key
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider')
    }
    return context
}
