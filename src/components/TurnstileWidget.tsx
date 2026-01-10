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
  autoRender?: boolean // Если false, виджет рендерится только по клику
}

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || ''

export function TurnstileWidget({ onVerify, onError, onExpire, theme = 'dark', autoRender = true }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [showWidget, setShowWidget] = useState(autoRender)

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) {
      console.warn('Turnstile: VITE_TURNSTILE_SITE_KEY not configured')
      return
    }

    const renderWidget = () => {
      if (!containerRef.current || !window.turnstile || widgetIdRef.current || !showWidget) return

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
      setIsScriptLoaded(true)
      renderWidget()
    } else if (existingScript) {
      // Скрипт есть, но ещё не загрузился
      window.onTurnstileLoad = () => {
        setIsScriptLoaded(true)
        renderWidget()
      }
    } else {
      // Загружаем скрипт
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit'
      script.async = true
      
      window.onTurnstileLoad = () => {
        setIsScriptLoaded(true)
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
  }, [onVerify, onError, onExpire, theme, showWidget])

  // Эффект для рендеринга виджета при изменении showWidget
  useEffect(() => {
    if (showWidget && isScriptLoaded && !widgetIdRef.current && containerRef.current && window.turnstile) {
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
  }, [showWidget, isScriptLoaded, onVerify, onError, onExpire, theme])

  const handleShowWidget = () => {
    setShowWidget(true)
  }

  if (!TURNSTILE_SITE_KEY) {
    return (
      <div style={{ margin: '16px 0', padding: '12px', background: '#2a2a2a', borderRadius: '8px', textAlign: 'center', color: '#888' }}>
        Turnstile не настроен
      </div>
    )
  }

  return (
    <div style={{ margin: '12px 0 8px', display: 'flex', justifyContent: 'center' }}>
      {!showWidget ? (
        <button
          type="button"
          onClick={handleShowWidget}
          className="turnstile-trigger-btn"
          style={{
            padding: '12px 24px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#1d4ed8'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb'
          }}
        >
          🛡️ Пройти проверку безопасности
        </button>
      ) : (
        <div 
          ref={containerRef} 
          className="turnstile-container"
          style={{ 
            minHeight: isLoaded ? 'auto' : '65px'
          }}
        />
      )}
    </div>
  )
}
