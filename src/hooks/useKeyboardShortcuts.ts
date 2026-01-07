import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      // Check for Ctrl key (Cmd on Mac)
      const isCtrl = e.ctrlKey || e.metaKey

      if (!isCtrl) return

      // Use e.code instead of e.key to support different keyboard layouts
      // e.code represents physical key position, not the character
      switch (e.code) {
        case 'KeyX': // X key (any layout)
          e.preventDefault()
          navigate('/dashboard')
          break
        case 'KeyG': // G key (any layout)
          e.preventDefault()
          navigate('/pricing')
          break
        case 'KeyH': // H key (any layout)
          e.preventDefault()
          navigate('/')
          break
        case 'KeyT': // T key (any layout)
          e.preventDefault()
          navigate('/dev-team')
          break
        case 'KeyP': // P key (any layout)
          e.preventDefault()
          navigate('/personal-data')
          break
        case 'KeyU': // U key (any layout)
          e.preventDefault()
          navigate('/user-agreement')
          break
        case 'KeyR': // R key (any layout)
          e.preventDefault()
          navigate('/usage-rules')
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [navigate])
}
