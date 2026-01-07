// Главный файл системы переводов ShakeDown

import type { Language, TranslationStructure } from './types'
import { ruTranslations } from './ru'
import { enTranslations } from './en'
import { ukTranslations } from './uk'
import { plTranslations } from './pl'
import { trTranslations } from './tr'
import { kzTranslations } from './kz'

// Экспорт типов
export type { Language, TranslationStructure }

// Объект со всеми переводами
export const translations: Record<Language, TranslationStructure> = {
  ru: ruTranslations,
  en: enTranslations,
  uk: ukTranslations,
  pl: plTranslations,
  tr: trTranslations,
  kz: kzTranslations
}

// Хук для получения переводов
export function getTranslation(lang: Language): TranslationStructure {
  return translations[lang] || translations.ru
}

// Получить текущий язык из localStorage
export function getCurrentLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'ru'
  }

  const saved = localStorage.getItem('language')
  if (saved && (saved === 'ru' || saved === 'en' || saved === 'uk' || saved === 'pl' || saved === 'tr' || saved === 'kz')) {
    return saved
  }

  const browserLangs = (Array.isArray(navigator.languages) && navigator.languages.length > 0)
    ? navigator.languages
    : [navigator.language]

  const normalized = browserLangs
    .filter(Boolean)
    .map((l) => l.toLowerCase())

  const detected: Language = normalized.some((l) => l === 'ru' || l.startsWith('ru-'))
    ? 'ru'
    : normalized.some((l) => l === 'en' || l.startsWith('en-'))
      ? 'en'
      : normalized.some((l) => l === 'uk' || l.startsWith('uk-') || l === 'ua' || l.startsWith('ua-'))
        ? 'uk'
        : normalized.some((l) => l === 'pl' || l.startsWith('pl-'))
          ? 'pl'
          : normalized.some((l) => l === 'tr' || l.startsWith('tr-'))
            ? 'tr'
            : normalized.some((l) => l === 'kz' || l.startsWith('kz-') || l === 'kk' || l.startsWith('kk-'))
              ? 'kz'
              : 'ru'

  localStorage.setItem('language', detected)
  return detected
}

// Установить язык в localStorage
export function setCurrentLanguage(lang: Language): void {
  localStorage.setItem('language', lang)
}

// Проверить, является ли строка валидным языком
export function isValidLanguage(lang: string): lang is Language {
  return lang === 'ru' || lang === 'en' || lang === 'uk' || lang === 'pl' || lang === 'tr' || lang === 'kz'
}

// Маппинг языков на локали для форматирования дат
export const dateLocales: Record<Language, string> = {
  ru: 'ru-RU',
  en: 'en-US',
  uk: 'uk-UA',
  pl: 'pl-PL',
  tr: 'tr-TR',
  kz: 'kk-KZ'
}

// Получить локаль для форматирования дат
export function getDateLocale(lang: Language): string {
  return dateLocales[lang] || 'ru-RU'
}