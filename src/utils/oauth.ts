export interface OAuthUser {
  id: string
  email: string
  username: string
  avatar?: string
  provider: 'google' | 'discord'
}

export class OAuthManager {
  private static instance: OAuthManager
  
  static getInstance(): OAuthManager {
    if (!OAuthManager.instance) {
      OAuthManager.instance = new OAuthManager()
    }
    return OAuthManager.instance
  }

  async initiateOAuth(provider: 'google' | 'discord'): Promise<void> {
    const urlParams = new URLSearchParams(window.location.search)
    const redirect = urlParams.get('redirect')
    const hwid = urlParams.get('hwid')
    
    // Redirect to backend OAuth route
    const apiUrl = import.meta.env.VITE_API_URL || 'https://booleanclient.online/api'
    let backendUrl = `${apiUrl}/oauth/${provider}`
    
    const params = new URLSearchParams()
    if (redirect) params.append('redirect', redirect)
    if (hwid) params.append('hwid', hwid)
    
    if (params.toString()) {
      backendUrl += `?${params.toString()}`
    }

    window.location.href = backendUrl
  }
}
