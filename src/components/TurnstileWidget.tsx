import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: TurnstileOptions) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
    onTurnstileLoad?: () => void
  }
}

interface TurnstileOptions {
  sitekey: string
  callback: (token: string) => void
  'error-callback'?: () => void
  'expired-callback'?: () => void
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact'
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void
  onError?: () => void
  onExpire?: () => void
  theme?: 'light' | 'dark' | 'auto'
}

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || ''

export function TurnstileWidget({ onVerify, onError, onExpire, theme = 'dark' }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) {
      console.warn('Turnstile: VITE_TURNSTILE_SITE_KEY not configured')
      return
    }

    const renderWidget = () => {
      if (!containerRef.current || !window.turnstile || widgetIdRef.current) return

      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token: string) => {
            console.log('Turnstile: verified')
            onVerify(token)
          },
          'error-callback': () => {
            console.error('Turnstile: error')
            onError?.()
          },
          'expired-callback': () => {
            console.log('Turnstile: expired')
            onExpire?.()
          },
          theme,
          size: 'normal'
        })
        setIsLoaded(true)
      } catch (err) {
        console.error('Turnstile render error:', err)
      }
    }

    // Проверяем, загружен ли уже скрипт
    const existingScript = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')
    
    if (window.turnstile) {
      // Скрипт уже загружен и готов
      renderWidget()
    } else if (existingScript) {
      // Скрипт есть, но ещё не загрузился
      window.onTurnstileLoad = () => {
        renderWidget()
      }
    } else {
      // Загружаем скрипт
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit'
      script.async = true
      
      window.onTurnstileLoad = () => {
        renderWidget()
      }
      
      script.onerror = () => {
        console.error('Turnstile: failed to load script')
      }
      
      document.head.appendChild(script)
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch (e) {
          // ignore
        }
        widgetIdRef.current = null
      }
    }
  }, [onVerify, onError, onExpire, theme])

  if (!TURNSTILE_SITE_KEY) {
    return (
      <div style={{ margin: '16px 0', padding: '12px', background: '#2a2a2a', borderRadius: '8px', textAlign: 'center', color: '#888' }}>
        Turnstile не настроен
      </div>
    )
  }

  return (
    <div style={{ margin: '12px 0 8px', display: 'flex', justifyContent: 'center' }}>
      <div 
        ref={containerRef} 
        className="turnstile-container"
        style={{ 
          minHeight: isLoaded ? 'auto' : '65px'
        }}
      />
    </div>
  )
}
