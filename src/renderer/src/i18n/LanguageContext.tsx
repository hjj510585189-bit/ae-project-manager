import { createContext, useContext, useState, ReactNode } from 'react'
import { Language, Translations, translations } from './translations'

interface LanguageContextValue {
  language: Language
  t: Translations
  toggleLanguage: () => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('ae-manager-lang') as Language) || 'zh'
  })

  const toggleLanguage = () => {
    const next: Language = language === 'zh' ? 'en' : 'zh'
    setLanguage(next)
    localStorage.setItem('ae-manager-lang', next)
  }

  return (
    <LanguageContext.Provider value={{ language, t: translations[language], toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
