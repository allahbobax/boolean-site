import { useState, useEffect } from 'react'
import '../styles/KeyboardShortcutsHelp.css'

const KeyboardShortcutsHelp = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     window.innerWidth <= 768
      setIsMobile(mobile)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    // Don't add keyboard listeners on mobile
    if (isMobile) return

    const handleKeyPress = (e: KeyboardEvent) => {
      // Toggle help with Ctrl+/ or Ctrl+? (check both key and code for Windows compatibility)
      if ((e.ctrlKey || e.metaKey) && (e.key === '/' || e.key === '?' || e.code === 'Slash')) {
        e.preventDefault()
        setIsVisible(prev => !prev)
      }
      
      // Close with Escape
      if (e.key === 'Escape' && isVisible) {
        setIsVisible(false)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isVisible, isMobile])

  // Don't render on mobile devices
  if (isMobile || !isVisible) return null

  const shortcuts = [
    { key: 'Ctrl + H', description: 'Home' },
    { key: 'Ctrl + X', description: 'Dashboard' },
    { key: 'Ctrl + G', description: 'Products' },
    { key: 'Ctrl + T', description: 'Dev Team' },
    { key: 'Ctrl + P', description: 'Privacy Policy' },
    { key: 'Ctrl + U', description: 'Terms of Service' },
    { key: 'Ctrl + R', description: 'Usage Rules' },
    { key: 'Ctrl + /', description: 'Toggle this help' },
  ]

  return (
    <>
      <div className="shortcuts-overlay" onClick={() => setIsVisible(false)} />
      <div className="shortcuts-modal">
        <div className="shortcuts-header">
          <h3>Keyboard Shortcuts</h3>
          <button className="shortcuts-close" onClick={() => setIsVisible(false)}>×</button>
        </div>
        <div className="shortcuts-content">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="shortcut-item">
              <kbd className="shortcut-key">{shortcut.key}</kbd>
              <span className="shortcut-description">{shortcut.description}</span>
            </div>
          ))}
        </div>
        <div className="shortcuts-footer">
          Press <kbd>Esc</kbd> or click outside to close
        </div>
      </div>
    </>
  )
}

export default KeyboardShortcutsHelp
