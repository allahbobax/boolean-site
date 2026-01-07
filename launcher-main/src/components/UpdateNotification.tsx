import React, { useEffect, useState } from 'react'
import '../styles/UpdateNotification.css'

interface UpdateInfo {
  version: string
  releaseDate?: string
  releaseNotes?: string
}

interface DownloadProgress {
  percent: number
  transferred: number
  total: number
  bytesPerSecond: number
}

const UpdateNotification: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null)
  const [updateReady, setUpdateReady] = useState(false)
  const [currentVersion, setCurrentVersion] = useState('')

  useEffect(() => {
    // Получаем текущую версию
    if (window.electron?.getAppVersion) {
      window.electron.getAppVersion().then((version: string) => {
        setCurrentVersion(version)
      })
    }

    // Слушаем события обновлений
    if (window.electron?.ipcRenderer) {
      window.electron.ipcRenderer.on('update-available', (_event: any, info: UpdateInfo) => {
        setUpdateAvailable(true)
        setUpdateInfo(info)
      })

      window.electron.ipcRenderer.on('update-download-progress', (_event: any, progress: DownloadProgress) => {
        setDownloadProgress(progress)
      })

      window.electron.ipcRenderer.on('update-downloaded', (_event: any, _info: UpdateInfo) => {
        setDownloading(false)
        setUpdateReady(true)
      })

      window.electron.ipcRenderer.on('update-not-available', () => {
        // No updates available
      })

      window.electron.ipcRenderer.on('update-error', (_event: any, _error: { message: string }) => {
        setDownloading(false)
      })
    }

    return () => {
      // Очистка слушателей при размонтировании
      if (window.electron?.ipcRenderer) {
        window.electron.ipcRenderer.removeListener('update-available', () => {})
        window.electron.ipcRenderer.removeListener('update-not-available', () => {})
        window.electron.ipcRenderer.removeListener('update-download-progress', () => {})
        window.electron.ipcRenderer.removeListener('update-downloaded', () => {})
        window.electron.ipcRenderer.removeListener('update-error', () => {})
      }
    }
  }, [])

  const handleDownload = async () => {
    setDownloading(true)
    if (window.electron?.downloadUpdate) {
      await window.electron.downloadUpdate()
    }
  }

  const handleInstall = () => {
    if (window.electron?.installUpdate) {
      window.electron.installUpdate()
    }
  }

  const handleDismiss = () => {
    setUpdateAvailable(false)
    setUpdateReady(false)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatSpeed = (bytesPerSecond: number) => {
    return formatBytes(bytesPerSecond) + '/s'
  }

  if (updateReady) {
    return (
      <div className="update-notification update-ready">
        <div className="update-icon">🎉</div>
        <div className="update-content">
          <h3>Обновление готово!</h3>
          <p>Версия {updateInfo?.version} загружена и готова к установке</p>
        </div>
        <div className="update-actions">
          <button className="btn-install" onClick={handleInstall}>
            Установить сейчас
          </button>
          <button className="btn-dismiss" onClick={handleDismiss}>
            Позже
          </button>
        </div>
      </div>
    )
  }

  if (downloading && downloadProgress) {
    return (
      <div className="update-notification update-downloading">
        <div className="update-icon">📥</div>
        <div className="update-content">
          <h3>Загрузка обновления...</h3>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${downloadProgress.percent}%` }}
            />
          </div>
          <div className="progress-info">
            <span>{downloadProgress.percent.toFixed(1)}%</span>
            <span>{formatBytes(downloadProgress.transferred)} / {formatBytes(downloadProgress.total)}</span>
            <span>{formatSpeed(downloadProgress.bytesPerSecond)}</span>
          </div>
        </div>
      </div>
    )
  }

  if (updateAvailable && updateInfo) {
    return (
      <div className="update-notification update-available">
        <div className="update-icon">🚀</div>
        <div className="update-content">
          <h3>Доступно обновление!</h3>
          <p>
            Новая версия {updateInfo.version} доступна для загрузки
            {currentVersion && ` (текущая: ${currentVersion})`}
          </p>
        </div>
        <div className="update-actions">
          <button className="btn-download" onClick={handleDownload}>
            Загрузить
          </button>
          <button className="btn-dismiss" onClick={handleDismiss}>
            Пропустить
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default UpdateNotification
