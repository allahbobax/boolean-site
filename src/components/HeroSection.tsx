import { useNavigate } from 'react-router-dom'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { FiShoppingCart } from 'react-icons/fi'
import { getTranslation } from '../utils/translations'
import type { Language } from '../utils/translations'

interface HeroSectionProps {
  lang?: Language
}

export default function HeroSection({ lang }: HeroSectionProps) {
  const navigate = useNavigate()
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1, rootMargin: '0px 0px -50px 0px' })

  const translation = getTranslation(lang || 'ru')

  return (
    <main
      ref={ref}
      data-animate="hero"
      className={`hero-section ${isVisible ? 'visible' : ''}`}
    >
      <div className="hero-bg-logo" />
      <div className="hero-wrapper">
        <div className={`hero-content ${isVisible ? 'animate-in' : ''}`}>

          <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: translation.hero.title }} />

          <p className="hero-subtitle">
            {translation.hero.subtitle}
          </p>

          <div className="hero-buttons">
            <button onClick={() => navigate('/login')} className="primary-button">
              <FiShoppingCart />
              <span>{translation.hero.cta}</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
