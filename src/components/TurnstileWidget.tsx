import { useEffect, useRef, useCallback } from 'react'

declare global {
  interface Window {
    turnstile: {
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

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAACLHUwqc37UxQbal'

export function TurnstileWidget({ onVerify, onError, onExpire, theme = 'dark' }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || widgetIdRef.current) return

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: onVerify,
      'error-callback': onError,
      'expired-callback': onExpire,
      theme,
      size: 'normal'
    })
  }, [onVerify, onError, onExpire, theme])

  useEffect(() => {
    // Загружаем скрипт Turnstile если его ещё нет
    const existingScript = document.querySelector('script[src*="turnstile"]')
    
    if (!existingScript) {
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad'
      script.async = true
      script.defer = true
      
      window.onTurnstileLoad = renderWidget
      document.head.appendChild(script)
    } else if (window.turnstile) {
      renderWidget()
    } else {
      window.onTurnstileLoad = renderWidget
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [renderWidget])

  if (!TURNSTILE_SITE_KEY) {
    return null // Не показываем виджет если ключ не настроен
  }

  return (
    <div 
      ref={containerRef} 
      className="turnstile-container"
      style={{ margin: '16px 0', display: 'flex', justifyContent: 'center' }}
    />
  )
}

export function useTurnstileReset() {
  return useCallback((widgetId: string) => {
    if (window.turnstile && widgetId) {
      window.turnstile.reset(widgetId)
    }
  }, [])
}
