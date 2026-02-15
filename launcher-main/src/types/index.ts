export interface User {
  id: number
  username: string
  email: string
  subscription: 'free' | 'premium' | 'alpha'
  subscriptionEndDate?: string | null
  avatar?: string
  uid?: string
  registeredAt: string
  settings?: UserSettings
  hwid?: string
}

export interface UserSettings {
  notifications: boolean
  autoUpdate: boolean
  theme: 'dark' | 'light' | 'auto'
  language: 'ru' | 'en' | 'uk'
  ramAllocation: number
  installPath: string
  interfaceSounds: boolean
}

export interface NewsPost {
  id: number
  title: string
  content: string
  date: string
  author: string
  type: 'launcher' | 'website'
}

export interface ServiceStatus {
  name: string
  status: string
  state: 'ok' | 'warning' | 'error' | 'idle'
}
