// Application constants

// Client info
export const CLIENT_INFO = {
  name: 'BOOLEAN',
  version: '1.21.4',
  minecraftVersion: '1.21.4',
  platform: 'Windows 10/11'
}

// Launcher download links
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

// Social links (fill later)
export const SOCIAL_LINKS = {
  discord: '', // Fill later
  telegram: '', // Fill later
  youtube: '',
  vk: ''
}

// Product type
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

// Function to fetch products from server
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

// Function to get a single product
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

// Fallback products (if API is unavailable)
export const PRODUCTS_FALLBACK: Product[] = [
  {
    id: 'client-30',
    name: '30 Days Access',
    price: 199,
    duration: 30,
    description: 'Access to the client for 30 days',
    features: ['Full functionality', 'Updates', 'Support']
  },
  {
    id: 'client-90',
    name: '90 Days Access',
    price: 449,
    duration: 90,
    description: 'Access to the client for 90 days',
    features: ['Full functionality', 'Updates', 'Support'],
    popular: true
  },
  {
    id: 'client-lifetime',
    name: 'Lifetime Access',
    price: 999,
    duration: -1,
    description: 'Lifetime access to the client',
    features: ['Full functionality', 'All updates', 'Priority support']
  },
  {
    id: 'hwid-reset',
    name: 'HWID Reset',
    price: 99,
    description: 'Reset hardware ID binding',
    features: ['Instant reset', 'New binding']
  },
  {
    id: 'alpha',
    name: 'ALPHA 1.21.4',
    price: 599,
    duration: -1,
    description: 'Client for version 1.21.4',
    features: ['Unique features', 'Updates', 'Support']
  },
  {
    id: 'premium-30',
    name: 'Premium 30D',
    price: 299,
    duration: 30,
    description: 'Premium status for 30 days',
    features: ['Exclusive features', 'Queue priority', 'Priority support']
  }
]

// Для обратной совместимости - экспортируем fallback как PRODUCTS
export const PRODUCTS = PRODUCTS_FALLBACK

// Способы оплаты
export const PAYMENT_METHODS = {
  youkassa: {
    name: 'YouKassa',
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
  en: { name: 'English', flagCode: 'gb' }
}

// Доступные темы
export const THEMES = {
  dark: { name: 'Dark', icon: '🌙' },
  light: { name: 'Light', icon: '☀️' }
}

// Видео-обзор
export const MEDIA = {
  videoPreview: 'https://www.youtube.com/embed/YOUR_VIDEO_ID', // Замените на ваше видео
  videoThumbnail: '/video-thumbnail.jpg' // Или используйте скриншот
}

// Размеры логотипа
export const LOGO_SIZES = {
  footer: 28,        // 28 * 4
  sidebar: 42,       // 40 * 4  
  mobile: 36,        // 36 * 4
  auth: 50,          // 80 * 4 (увеличено с 40)
  error: 40          // 40 * 4
}

// Поворот логотипа
export const LOGO_ROTATION = '12deg'

// Логотип сайта (WebP)
export const SITE_LOGO = `
<img src="/icon.png" alt="Boolean" width="120" height="120" style="image-rendering: pixelated; transform: rotate(${LOGO_ROTATION});" />
`
