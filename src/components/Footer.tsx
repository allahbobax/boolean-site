import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { CLIENT_INFO, SOCIAL_LINKS } from '../utils/constants'
import { getTranslation, Language } from '../utils/translations'
import LogoWithHat from './LogoWithHat'

interface FooterProps {
  lang: Language
}

type StatusLevel = 'operational' | 'degraded' | 'partial' | 'major'

interface StatusInfo {
  level: StatusLevel
  text: string
  textRu: string
}

const STATUS_CONFIG: Record<StatusLevel, StatusInfo> = {
  operational: { level: 'operational', text: 'All Systems Operational', textRu: 'Все системы работают' },
  degraded: { level: 'degraded', text: 'Degraded Performance', textRu: 'Снижена производительность' },
  partial: { level: 'partial', text: 'Partial Outage', textRu: 'Частичный сбой' },
  major: { level: 'major', text: 'Major Outage', textRu: 'Серьёзный сбой' }
}

export default function Footer({ lang }: FooterProps) {
  const t = getTranslation(lang)
  const [status, setStatus] = useState<StatusInfo>(STATUS_CONFIG.operational)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('https://api.booleanclient.ru/incidents?action=active')
        const data = await response.json()
        
        if (data.success && data.data && data.data.length > 0) {
          // Определяем уровень по самому серьёзному инциденту
          const severities = data.data.map((i: { severity: string }) => i.severity)
          if (severities.includes('critical')) {
            setStatus(STATUS_CONFIG.major)
          } else if (severities.includes('major')) {
            setStatus(STATUS_CONFIG.partial)
          } else {
            setStatus(STATUS_CONFIG.degraded)
          }
        } else {
          setStatus(STATUS_CONFIG.operational)
        }
      } catch {
        // При ошибке показываем operational
        setStatus(STATUS_CONFIG.operational)
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 60000) // Обновляем каждую минуту
    return () => clearInterval(interval)
  }, [])

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links-section">
          <div className="footer-logo-top">
            <LogoWithHat
              alt="Boolean"
              size={45}
              className="footer-logo-top no-user-drag"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            />
            <span className="footer-name-top gradient-text">{CLIENT_INFO.name}</span>
          </div>
          <div className="footer-links">
            <Link to="/pricing">{t.nav.services}</Link>
            <Link to="/dashboard">{t.nav.dashboard}</Link>
          </div>
          <a 
            href="https://status.booleanclient.ru" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-status-link"
          >
            <span className={`status-indicator status-${status.level}`}></span>
            <span>{lang === 'ru' ? status.textRu : status.text}</span>
          </a>
        </div>
        <div className="footer-social">
          {SOCIAL_LINKS.discord && (
            <a href={SOCIAL_LINKS.discord} target="_blank" rel="noopener noreferrer">Discord</a>
          )}
          {SOCIAL_LINKS.telegram && (
            <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noopener noreferrer">Telegram</a>
          )}
        </div>
        <div className="footer-legal">
          <h3 className="legal-title">Navigation</h3>
          <div className="legal-links">
            <Link to="/personal-data">{t.footer.personalData}</Link>
            <Link to="/user-agreement">{t.footer.userAgreement}</Link>
            <Link to="/usage-rules">{t.footer.usageRules}</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 {CLIENT_INFO.name}. {t.footer.rights}</p>
      </div>
    </footer>
  )
}
