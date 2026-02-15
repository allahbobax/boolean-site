import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { CLIENT_INFO, SOCIAL_LINKS, LOGO_SIZES } from '../utils/constants'
import { useTranslation } from '../hooks/useTranslation'
import { useTheme } from '../hooks/useTheme'
import LogoWithHat from './LogoWithHat'

type StatusLevel = 'operational' | 'degraded' | 'partial' | 'major'

interface StatusInfo {
  level: StatusLevel
  text: string
}

const STATUS_CONFIG: Record<StatusLevel, StatusInfo> = {
  operational: { level: 'operational', text: 'All Systems Operational' },
  degraded: { level: 'degraded', text: 'Degraded Performance' },
  partial: { level: 'partial', text: 'Partial Outage' },
  major: { level: 'major', text: 'Major Outage' }
}

const statusColors: Record<StatusLevel, string> = {
  operational: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]',
  degraded: 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]',
  partial: 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]',
  major: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
}

export default function Footer() {
  const { t } = useTranslation()
  const [status, setStatus] = useState<StatusInfo>(STATUS_CONFIG.operational)
  const theme = useTheme()
  const isDark = theme !== 'light'

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('https://api.booleanclient.online/incidents?action=active')
        const data = await response.json()
        
        if (data.success && data.data && data.data.length > 0) {
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
        setStatus(STATUS_CONFIG.operational)
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  const linkClasses = `no-underline transition-colors duration-300 font-medium
    ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`

  return (
    <footer className={`px-16 pb-8 relative z-[1] max-[1024px]:px-8 max-[480px]:px-4 max-[480px]:pt-12 max-[480px]:pb-6 overflow-visible
      ${isDark ? 'bg-black' : 'bg-gray-100'}`}>
      <div className="max-w-[1200px] mx-auto pt-6 flex justify-between items-start mb-4 max-[1024px]:flex-col max-[1024px]:gap-8 max-[1024px]:text-center max-[1024px]:items-center">
        
        {/* Logo & Links Section */}
        <div className="flex flex-col items-start gap-4 flex-1 max-[1024px]:items-center max-[768px]:items-center">
          <div className="flex items-center overflow-visible">
            <LogoWithHat
              alt="Boolean"
              size={LOGO_SIZES.footer}
              className="mr-[17px] -ml-[15px] no-user-drag"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            />
            <span className={`text-[1.75rem] font-bold -ml-[15px] ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {CLIENT_INFO.name}
            </span>
          </div>
          <div className="flex gap-8 max-[768px]:flex-col max-[768px]:items-center max-[768px]:gap-3">
            <Link to="/pricing" className={linkClasses}>{t.nav.services}</Link>
            <Link to="/dashboard" className={linkClasses}>{t.nav.dashboard}</Link>
          </div>
          <a 
            href="https://status.booleanclient.online" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`flex items-center gap-2 no-underline transition-colors duration-300 font-medium
              ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusColors[status.level]}`}></span>
            <span>{status.text}</span>
          </a>
        </div>

        {/* Social Links */}
        <div className="flex gap-6 flex-1 justify-center max-[768px]:flex-col max-[768px]:items-center max-[768px]:gap-3">
          {SOCIAL_LINKS.discord && (
            <a href={SOCIAL_LINKS.discord} target="_blank" rel="noopener noreferrer" className={linkClasses}>Discord</a>
          )}
          {SOCIAL_LINKS.telegram && (
            <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noopener noreferrer" className={linkClasses}>Telegram</a>
          )}
        </div>

        {/* Legal Links */}
        <div className="flex flex-col gap-4 flex-1 max-[1024px]:items-center max-[768px]:items-center">
          <h3 className={`text-sm font-semibold uppercase tracking-wider m-0
            ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
            Navigation
          </h3>
          <div className="flex flex-col gap-1 max-[768px]:items-center">
            <Link to="/personal-data" className={`${linkClasses} py-1`}>{t.footer.personalData}</Link>
            <Link to="/user-agreement" className={`${linkClasses} py-1`}>{t.footer.userAgreement}</Link>
            <Link to="/usage-rules" className={`${linkClasses} py-1`}>{t.footer.usageRules}</Link>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className={`text-center pt-4 flex flex-col items-center gap-4 border-t
        ${isDark ? 'border-white/5' : 'border-black/10'}`}>
        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
          © 2026 {CLIENT_INFO.name}. {t.footer.rights}
        </p>
      </div>
    </footer>
  )
}
