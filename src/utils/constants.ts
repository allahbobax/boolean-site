// Константы приложения

// Информация о клиенте
export const CLIENT_INFO = {
  name: 'BOOLEAN',
  version: '1.21.4',
  minecraftVersion: '1.21.4',
  platform: 'Windows 10/11'
}

// Ссылки на скачивание лаунчера
export const WINDOWS_EXE_LINK = 'https://github.com/nihmadev/hoka/releases/download/v1/Boolean.Launcher_0.1.0_x64-setup.exe'
export const WINDOWS_MSI_LINK = 'https://github.com/nihmadev/hoka/releases/download/v1/Boolean.Launcher_0.1.0_x64_en-US.msi'

export const DOWNLOAD_LINKS = {
  windows_exe: WINDOWS_EXE_LINK,
  windows_msi: WINDOWS_MSI_LINK,
  macos: 'https://github.com/nihmadev/hoka/releases/download/v1/Boolean.Launcher_0.1.0_aarch64.dmg',
  macos_arm64: 'https://github.com/nihmadev/hoka/releases/download/v1/Boolean.Launcher_0.1.0_x64.dmg',
  linux_rpm: 'https://github.com/nihmadev/hoka/releases/download/v1/Boolean.Launcher-0.1.0-1.x86_64.rpm',
  linux_deb: 'https://github.com/nihmadev/hoka/releases/download/v1/Boolean.Launcher_0.1.0_amd64.deb',
  linux_appimage: 'https://github.com/nihmadev/hoka/releases/download/v1/Boolean.Launcher_0.1.0_amd64.AppImage',
}

// Социальные сети (заполнишь позже)
export const SOCIAL_LINKS = {
  discord: '', // Заполнить позже
  telegram: '', // Заполнить позже
  youtube: '',
  vk: ''
}

// Тип продукта
export interface Product {
  id: string
  name: string
  price: number
  duration?: number
  description: string
  features: string[]
  popular?: boolean
  discount?: number
  originalPrice?: number
}

import { API_URL, getProtectedHeaders } from './apiConfig'

// Функция загрузки продуктов с сервера
export async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_URL}/products`, {
      headers: getProtectedHeaders(),
    })
    const data = await response.json()
    if (data.success) {
      return data.data
    }
    return []
  } catch (error) {
    return []
  }
}

// Функция получения одного продукта
export async function fetchProduct(id: string): Promise<Product | null> {
  try {
    const response = await fetch(`${API_URL}/products?id=${id}`, {
      headers: getProtectedHeaders(),
    })
    const data = await response.json()
    if (data.success) {
      return data.data
    }
    return null
  } catch (error) {
    return null
  }
}

// Fallback продукты (на случай если API недоступен)
export const PRODUCTS_FALLBACK: Product[] = [
  {
    id: 'client-30',
    name: 'Клиент на 30 дней',
    price: 199,
    duration: 30,
    description: 'Доступ к клиенту на 30 дней',
    features: ['Полный функционал', 'Обновления', 'Поддержка']
  },
  {
    id: 'client-90',
    name: 'Клиент на 90 дней',
    price: 449,
    duration: 90,
    description: 'Доступ к клиенту на 90 дней',
    features: ['Полный функционал', 'Обновления', 'Поддержка'],
    popular: true
  },
  {
    id: 'client-lifetime',
    name: 'Клиент навсегда',
    price: 999,
    duration: -1,
    description: 'Пожизненный доступ к клиенту',
    features: ['Полный функционал', 'Все обновления', 'Приоритетная поддержка']
  },
  {
    id: 'hwid-reset',
    name: 'Сброс привязки',
    price: 99,
    description: 'Сброс HWID привязки',
    features: ['Мгновенный сброс', 'Новая привязка']
  },
  {
    id: 'alpha',
    name: 'ALPHA 1.16.5',
    price: 599,
    duration: -1,
    description: 'Клиент для версии 1.16.5',
    features: ['Уникальные функции', 'Обновления', 'Поддержка']
  },
  {
    id: 'premium-30',
    name: 'Premium 30D',
    price: 299,
    duration: 30,
    description: 'Premium статус на 30 дней',
    features: ['Эксклюзивные функции', 'Приоритет в очереди', 'Приоритетная поддержка']
  }
]

// Для обратной совместимости - экспортируем fallback как PRODUCTS
export const PRODUCTS = PRODUCTS_FALLBACK

// Способы оплаты
export const PAYMENT_METHODS = {
  youkassa: {
    name: 'ЮKassa',
    enabled: true,
    currencies: ['RUB']
  },
  funpay: {
    name: 'FunPay',
    enabled: true,
    url: '' // Заполнить позже
  }
}

// Доступные языки (flagCode для библиотеки flag-icons)
export const LANGUAGES = {
  ru: { name: 'Русский', flagCode: 'ru' },
  en: { name: 'English', flagCode: 'gb' },
  uk: { name: 'Українська', flagCode: 'ua' },
  pl: { name: 'Polski', flagCode: 'pl' },
  tr: { name: 'Türkçe', flagCode: 'tr' },
  kz: { name: 'Қазақша', flagCode: 'kz' }
}

// Доступные темы
export const THEMES = {
  dark: { name: 'Тёмная', icon: '🌙' },
  light: { name: 'Светлая', icon: '☀️' }
}

// Видео-обзор
export const MEDIA = {
  videoPreview: 'https://www.youtube.com/embed/YOUR_VIDEO_ID', // Замените на ваше видео
  videoThumbnail: '/video-thumbnail.jpg' // Или используйте скриншот
}

// Логотип сайта (WebP)
export const SITE_LOGO = `
<img src="/icon.png" alt="Boolean" width="120" height="120" style="image-rendering: pixelated;" />
`
