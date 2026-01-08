import { useNavigate } from 'react-router-dom'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { useTheme } from '../hooks/useTheme'
import { FiShoppingCart } from 'react-icons/fi'
import { getTranslation } from '../utils/translations'
import type { Language } from '../utils/translations'
import DOMPurify from 'dompurify'

interface HeroSectionProps {
  lang?: Language
}

export default function HeroSection({ lang }: HeroSectionProps) {
  const navigate = useNavigate()
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1, rootMargin: '0px 0px -50px 0px' })
  const theme = useTheme()

  const translation = getTranslation(lang || 'ru')
  const isDark = theme !== 'light'

  return (
    <main
      ref={ref}
      data-animate="hero"
      className={`min-h-screen flex items-center justify-center px-4 py-16 relative z-[1] text-center overflow-hidden ${isVisible ? 'visible' : ''}`}
    >
      <div className="relative w-full max-w-[1200px] min-h-[600px] flex items-center justify-center p-8 rounded-[32px]">
        <div className={`max-w-[900px] relative z-[2] ${isVisible ? 'animate-in' : ''}`}>

          <h1 
            className={`text-[4rem] max-[1200px]:text-[3.5rem] max-[1024px]:text-[3rem] max-[768px]:text-[2.5rem] max-[480px]:text-[2rem] font-extrabold leading-[1.1] mb-8
              ${isDark ? 'text-white' : 'text-black'}
              [&_.highlight-text]:font-[Caveat,cursive] [&_.highlight-text]:text-[1.3em] [&_.highlight-text]:font-semibold [&_.highlight-text]:relative [&_.highlight-text]:inline-block
              ${isDark 
                ? '[&_.highlight-text]:text-white [&_.highlight-text]:drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]' 
                : '[&_.highlight-text]:text-black'
              }`}
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(translation.hero.title, {
                ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span', 'br'],
                ALLOWED_ATTR: ['class']
              }) 
            }} 
          />

          <p className={`text-xl max-[768px]:text-base mb-12 leading-relaxed max-w-[700px] mx-auto
            ${isDark ? 'text-white' : 'text-gray-700'}`}>
            {translation.hero.subtitle}
          </p>

          <div className="flex justify-center gap-6 max-[768px]:flex-col max-[768px]:w-full">
            <button 
              onClick={() => navigate('/login')} 
              className={`flex items-center gap-3 border-none py-4 px-10 rounded-3xl text-lg font-bold cursor-pointer transition-all duration-300
                max-[768px]:w-full max-[768px]:justify-center
                ${isDark 
                  ? 'bg-white text-black hover:bg-gray-100' 
                  : 'bg-black text-white hover:bg-gray-900'
                }`}
            >
              <FiShoppingCart className="text-xl" />
              <span>{translation.hero.cta}</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
