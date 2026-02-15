import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { useTheme } from '../hooks/useTheme'
import { useTranslation } from '../hooks/useTranslation'
import { IconToaster, IconDesktopDream, IconSliders, IconRefresh, IconSupport, IconLock } from './Icons'

export default function FeaturesSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1, rootMargin: '0px 0px -50px 0px' })
  const { t } = useTranslation()
  const theme = useTheme()
  const isDark = theme !== 'light'

  const headerFeature = { icon: <IconToaster />, title: t.features.optimization, desc: t.features.optimizationDesc }

  const features = [
    { icon: <IconDesktopDream />, title: t.features.interface, desc: t.features.interfaceDescFull },
    { icon: <IconSliders />, title: t.features.customization, desc: t.features.customizationDesc },
    { icon: <IconRefresh />, title: t.features.updates, desc: t.features.updatesDescFull },
    { icon: <IconLock />, title: t.features.security, desc: t.features.securityDesc },
    { icon: <IconSupport />, title: t.features.support, desc: t.features.supportDescFull }
  ]

  const borderColor = isDark ? 'border-white/[0.08]' : 'border-black/[0.08]'
  const hoverBg = isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-black/[0.02]'
  const titleColor = isDark ? 'text-white' : 'text-gray-900'
  const descColor = 'text-gray-500'
  const iconColor = isDark ? 'text-white' : 'text-gray-900'

  return (
    <section
      id="features"
      ref={ref}
      data-animate="features"
      className={`p-0 relative z-[1] border-t ${borderColor} ${isDark ? 'bg-black' : 'bg-white'} ${isVisible ? 'visible' : ''}`}
    >
      <div className="max-w-[1400px] mx-auto grid grid-cols-4 max-[768px]:grid-cols-1 gap-0">
        {/* Header Section */}
        <div className={`contents animate-fade-up ${isVisible ? 'visible' : ''}`}>
          {/* Title Block */}
          <div className={`col-span-1 row-span-1 p-6 border-r border-b ${borderColor} max-[768px]:border-r-0 max-[768px]:text-center max-[768px]:py-8 max-[768px]:px-6`}>
            <h2 className={`text-[2.5rem] max-[768px]:text-[1.75rem] max-[480px]:text-2xl font-extrabold leading-[1.1] mb-4 ${titleColor}`}>
              {t.features.ourAdvantages}
            </h2>
            <p className={`text-[1.05rem] max-[480px]:text-[0.9rem] leading-relaxed ${descColor}`}>
              {t.features.ourAdvantagesDesc}
            </p>
          </div>

          {/* First Feature (under title) */}
          <div className={`col-span-1 row-span-1 p-6 border-r border-b ${borderColor} flex flex-col justify-start transition-all duration-300 ${hoverBg} max-[768px]:border-r-0 group`}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-base opacity-90 transition-all duration-300 ${iconColor} group-hover:scale-110`}>
                {headerFeature.icon}
              </span>
              <h4 className={`text-[0.95rem] font-bold m-0 ${titleColor}`}>{headerFeature.title}</h4>
            </div>
            <p className={`text-[0.85rem] leading-relaxed m-0 ${descColor}`}>{headerFeature.desc}</p>
          </div>
        </div>

        {/* Feature Cards */}
        {features.map((feature, index) => (
          <div
            key={index}
            className={`p-6 bg-transparent transition-all duration-300 ${hoverBg} group
              ${index < 2 ? `border-r border-b ${borderColor}` : ''}
              ${index === 2 ? `border-b ${borderColor}` : ''}
              ${index === 3 ? `border-r ${borderColor}` : ''}
              max-[768px]:border-r-0 max-[768px]:border-b max-[768px]:last:border-b-0
              animate-fade-up ${isVisible ? 'visible' : ''}`}
            style={{ transitionDelay: `${0.1 * (index + 1)}s` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-base opacity-90 transition-all duration-300 ${iconColor} group-hover:scale-110`}>
                {feature.icon}
              </span>
              <h4 className={`text-[0.95rem] max-[480px]:text-[0.9rem] font-bold m-0 ${titleColor}`}>{feature.title}</h4>
            </div>
            <p className={`text-[0.85rem] max-[480px]:text-[0.8rem] leading-relaxed m-0 ${descColor}`}>{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
