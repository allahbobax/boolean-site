import { useNavigate } from 'react-router-dom'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { useTheme } from '../hooks/useTheme'
import { FiShoppingCart } from 'react-icons/fi'
import { useTranslation } from '../hooks/useTranslation'
import DOMPurify from 'dompurify'
import { TopographyBackground } from './tp'

export default function HeroSection() {
  const navigate = useNavigate()
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1, rootMargin: '0px 0px -50px 0px', triggerOnce: true })
  const theme = useTheme()
  const { t: translation } = useTranslation()

  const isDark = theme !== 'light'

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16 relative text-center overflow-hidden">
      <TopographyBackground className="absolute inset-0" />
      <div 
        ref={ref}
        data-animate="hero"      
        className={`relative w-full max-w-[1200px] min-h-[600px] flex items-center justify-center p-8 rounded-[32px] z-10 ${isVisible ? 'visible' : ''}`}
      >
        <div className="max-w-[900px] relative z-[2] hero-content">
          <h1 
            className={`text-[4rem] max-[1200px]:text-[3.5rem] max-[1024px]:text-[3rem] max-[768px]:text-[2.5rem] max-[480px]:text-[2rem] font-extrabold leading-[1.1] mb-3
              ${isDark ? 'text-white' : 'text-black'}
              [&_.highlight-text]:font-[Caveat,cursive] [&_.highlight-text]:text-[1.3em] max-[768px]:[&_.highlight-text]:text-[1.5em] max-[480px]:[&_.highlight-text]:text-[1.6em] [&_.highlight-text]:font-semibold [&_.highlight-text]:relative [&_.highlight-text]:inline-block
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

          <p className={`text-xl max-[768px]:text-base mb-8 leading-relaxed max-w-[700px] mx-auto
            ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
            {translation.hero.subtitle}
          </p>

          <div className="flex justify-center gap-6 max-[768px]:flex-col max-[768px]:w-full">
            <button 
              onClick={() => navigate('/auth')} 
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
