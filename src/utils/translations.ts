// Re-export only the necessary functions to avoid circular imports
// This file is kept for backward compatibility

export { 
  getCurrentLanguage, 
  setCurrentLanguage, 
  getTranslation, 
  isValidLanguage, 
  getDateLocale,
  type Language,
  type TranslationStructure 
} from './translations/index'
