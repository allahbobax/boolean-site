import { LicenseKey } from '../../../types'

export const generateKey = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const segments = 4
  const segmentLength = 5
  const keyParts: string[] = []
  
  for (let i = 0; i < segments; i++) {
    let segment = ''
    for (let j = 0; j < segmentLength; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    keyParts.push(segment)
  }
  
  return keyParts.join('-')
}

export const getProductName = (product: LicenseKey['product']): string => {
  const names: Record<LicenseKey['product'], string> = {
    'premium': 'Premium подписка',
    'alpha': 'Alpha подписка',
    'inside-client': 'Shakedown Client',
    'inside-spoofer': 'Shakedown Spoofer',
    'inside-cleaner': 'Shakedown Cleaner'
  }
  return names[product]
}

export const getProductColor = (product: LicenseKey['product']): string => {
  const colors: Record<LicenseKey['product'], string> = {
    'premium': 'purple',
    'alpha': 'pink',
    'inside-client': 'blue',
    'inside-spoofer': 'orange',
    'inside-cleaner': 'green'
  }
  return colors[product]
}
