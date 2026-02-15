export interface User {
  id: number | string
  username: string
  email: string
  password?: string
  subscription: 'free' | 'premium' | 'alpha'
  subscriptionEndDate?: string
  registeredAt: string
  avatar?: string
  settings: UserSettings
  isAdmin?: boolean
  isBanned?: boolean
  emailVerified?: boolean
  profile?: UserProfile
  hwid?: string
  lastActiveAt?: string
  oauthProvider?: 'google' | 'discord'
  oauthId?: string
}

export interface UserProfile {
  displayName?: string
}

export interface UserSettings {
  notifications: boolean
  autoUpdate: boolean
  theme: 'dark' | 'light' | 'auto'
  language: 'ru' | 'en' | 'uk'
  snowEnabled: boolean
}

export type NotificationType = 'success' | 'error' | 'info' | 'warning'

export interface LicenseKey {
  id: string
  key: string
  product: 'premium' | 'alpha' | 'inside-client' | 'inside-spoofer' | 'inside-cleaner'
  duration: number // в днях, 0 = бессрочно
  createdAt: string
  usedAt?: string
  usedBy?: string | number
  isUsed: boolean
  createdBy: string
}

export interface ClientVersion {
  id: number
  version: string
  downloadUrl: string
  description?: string | null
  isActive: boolean
  createdAt: string
}
