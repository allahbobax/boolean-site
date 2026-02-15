// Главный файл системы переводов ShakeDown

import type { Language, TranslationStructure } from './types'
import { enTranslations } from './en'

// Экспорт типов
export type { Language, TranslationStructure }

// Объект со всеми переводами
export const translations: Record<Language, TranslationStructure> = {
  en: enTranslations,
  ru: enTranslations,
  uk: enTranslations,
  pl: enTranslations,
  tr: enTranslations,
  kz: enTranslations
}

// Хук для получения переводов
export function getTranslation(lang: Language): TranslationStructure {
  return translations[lang] || translations.en
}

// Получить текущий язык из localStorage
export function getCurrentLanguage(): Language {
  const savedLang = localStorage.getItem('language') as Language
  return isValidLanguage(savedLang) ? savedLang : 'en'
}

// Установить язык в localStorage
export function setCurrentLanguage(lang: Language): void {
  localStorage.setItem('language', lang)
}

// Проверить, является ли строка валидным языком
export function isValidLanguage(lang: string): lang is Language {
  return ['en', 'ru', 'uk', 'pl', 'tr', 'kz'].includes(lang)
}

// Маппинг языков на локали для форматирования дат
export const dateLocales: Record<Language, string> = {
  en: 'en-US',
  ru: 'ru-RU',
  uk: 'uk-UA',
  pl: 'pl-PL',
  tr: 'tr-TR',
  kz: 'kk-KZ'
}

// Получить локаль для форматирования дат
export function getDateLocale(lang: Language): string {
  return dateLocales[lang] || 'en-US'
}