import { CLIENT_INFO, LOGO_SIZES } from '../../../utils/constants'
import LogoWithHat from '../../../components/LogoWithHat'

interface Props {
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}

export function MobileHeader({ mobileMenuOpen, setMobileMenuOpen }: Props) {
  return (
    <header className="mobile-header">
      <div className="mobile-header-left">
        <LogoWithHat
          alt="Boolean"
          size={LOGO_SIZES.mobile}
          className="mobile-logo no-user-drag"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        />
        <span className="mobile-brand">{CLIENT_INFO.name}</span>
      </div>
      <button
        className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </header>
  )
}
