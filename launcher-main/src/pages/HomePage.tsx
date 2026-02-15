import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import type { User } from '../types'
import '../styles/HomePage.css'


interface HomePageProps {
  user: User
}

interface Server {
  id: string
  name: string
  version: string
  badge?: string
  isFree?: boolean
  className: string
  description: string
  subtitle?: string
}

interface LaunchProgress {

  stage: string
  progress: number
  message?: string
}

export default function HomePage({ user }: HomePageProps) {
  const { t } = useLanguage()

  const SERVERS: Server[] = [
    {
      id: 'main',
      name: '1.21.4',
      version: '1.21.4',
      badge: t('home.client'),
      className: 'server-main',
      subtitle: 'Client',
      description: 'We have created for you the best client that will give you a huge advantage in the game. This client has a huge functionality that will fit under all popular minecraft servers. This client is stable, which means that you will get the best gaming experience without bugs and various errors.'
    },
    {
      id: 'alpha',
      name: 'ALPHA 1.21.4',
      version: '1.21.4',
      badge: t('home.client'),
      className: 'server-alpha',
      subtitle: 'Client',
      description: 'Experience the classic 1.21.4 version with our optimized client. Perfect for PVP and survival with enhanced FPS and custom features.'
    }
  ]

  const [launchingServer, setLaunchingServer] = useState<string | null>(null)
  const [selectedServer, setSelectedServer] = useState<Server | null>(null)

  const [progress, setProgress] = useState<LaunchProgress | null>(null)

  useEffect(() => {
    if (!window.electron) return

    const handleProgress = (_: any, data: LaunchProgress) => {
      setProgress(data)
    }

    const handleMinecraftLoading = (_: any, data: any) => {
      if (!data.loading) {
        setLaunchingServer(null)
        setProgress(null)
      }
    }

    window.electron.ipcRenderer.on('minecraft-progress', handleProgress)
    window.electron.ipcRenderer.on('client-install-progress', handleProgress)
    window.electron.ipcRenderer.on('minecraft-loading', handleMinecraftLoading)

    return () => {
      window.electron?.ipcRenderer.removeListener('minecraft-progress', handleProgress)
      window.electron?.ipcRenderer.removeListener('client-install-progress', handleProgress)
      window.electron?.ipcRenderer.removeListener('minecraft-loading', handleMinecraftLoading)
    }
  }, [])

  const handleLaunch = async (server: Server) => {
    if (!window.electron || launchingServer) return

    setLaunchingServer(server.id)
    setProgress({ stage: 'init', progress: 0, message: t('home.init') })

    try {
      // Load settings from localStorage
      const savedSettings = localStorage.getItem('settings')
      let ramMb = 4096
      let windowWidth = 925
      let windowHeight = 530
      let fullscreen = false
      let installPath: string | undefined = undefined
      
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings)
          ramMb = settings.ramAllocation || 4096
          windowWidth = settings.windowWidth || 925
          windowHeight = settings.windowHeight || 530
          fullscreen = settings.fullscreen || false
          installPath = settings.installPath || undefined
        } catch (e) {
          // Failed to parse settings
        }
      }
      
      const javaPath = localStorage.getItem('javaPath') || undefined
      const launchOptions = {
        username: user.username,
        javaPath,
        ramMb,
        windowWidth,
        windowHeight,
        fullscreen,
        installPath
      }

      // Всегда используем installAndLaunchClient - он устанавливает моды Boolean и запускает игру
      setProgress({ stage: 'installing', progress: 0, message: t('home.installing') })
      const result = await window.electron.installAndLaunchClient(user.id, launchOptions)

      if (!result.success) {
        alert(`${t('home.launch_error')}: ${result.error}`)
        setLaunchingServer(null)
        setProgress(null)
      } else {
        setProgress({ stage: 'loading', progress: 100, message: t('home.minecraft_loading') })
        // Will be reset by minecraft-loading event
        setTimeout(() => {
          setLaunchingServer(null)
          setProgress(null)
        }, 60000)
      }
    } catch (error) {
      alert(`${t('home.error')}: ${error}`)
      setLaunchingServer(null)
      setProgress(null)
    }
  }

  const handleCardClick = (server: Server) => {
    setSelectedServer(server)
  }

  const handleReturn = () => {
    if (!launchingServer) {
      setSelectedServer(null)
    }
  }

  return (
    <div className="page home-page">
      {selectedServer ? (
        <div className="game-details-container animate-fade-in">
          <div className="game-details-header">
            <button className="return-button" onClick={handleReturn} disabled={!!launchingServer}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="return-icon">
                <path d="M19 12H5M5 12L12 5M5 12L12 19" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="game-details-content">
            <div className={`game-card-large ${selectedServer.className}`}>
              <div className="game-card-bg" />
            </div>

            <div className="game-info">
              <div className="game-title-group">
                <h1 className="game-title">{selectedServer.name}</h1>
                {selectedServer.subtitle && <h2 className="game-subtitle">{selectedServer.subtitle}</h2>}
              </div>

              <p className="game-description">
                {selectedServer.description}
              </p>

              <div className="game-actions">
                <button
                  className={`launch-button-large ${launchingServer ? 'disabled' : ''}`}
                  onClick={() => handleLaunch(selectedServer)}
                  disabled={!!launchingServer}
                >
                  {launchingServer ? (
                    <div className="launch-status">
                      <div className="spinner-small" />
                      <span>{progress?.message || t('home.loading')}</span>
                    </div>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="play-icon">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      LAUNCH
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="servers-grid">
          {SERVERS.map(server => (
            <div
              key={server.id}
              className={`server-card ${server.className} ${launchingServer === server.id ? 'launching' : ''}`}
              onClick={() => handleCardClick(server)}
            >
              <div className="server-card-bg" />
              <div className="server-card-overlay" />

              <div className="server-card-content">
                <div className="server-card-badges">
                  {server.isFree && <span className="badge badge-free">{t('home.free')}</span>}
                  {server.badge && <span className="badge badge-client">{server.badge}</span>}
                </div>

                <div className="server-card-footer">
                  <span className="server-name">{server.name}</span>
                  <div className="server-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
