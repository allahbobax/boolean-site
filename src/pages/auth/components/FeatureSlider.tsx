import { useEffect, useRef } from 'react'
import { FEATURES } from '../constants/features'

interface FeatureSliderProps {
  currentFeature: number
  setCurrentFeature: React.Dispatch<React.SetStateAction<number>>
  t: any
}

export function FeatureSlider({ currentFeature, setCurrentFeature, t }: FeatureSliderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const lastWheelAtRef = useRef(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handler = (e: WheelEvent) => {
      const now = Date.now()
      if (now - lastWheelAtRef.current < 180) return

      const { deltaY } = e
      if (deltaY === 0) return

      e.preventDefault()

      lastWheelAtRef.current = now

      const direction = deltaY > 0 ? 1 : -1
      const step = Math.min(3, Math.floor(Math.abs(deltaY) / 120) + 1)
      const delta = direction * step

      setCurrentFeature((prev) => {
        const next = (prev + delta) % FEATURES.length
        return next < 0 ? next + FEATURES.length : next
      })
    }

    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [setCurrentFeature])

  return (
    <div className="auth-left-panel" ref={containerRef}>
      <div className="slider-content">
        <div className="feature-icon">
          {FEATURES[currentFeature].icon}
        </div>
        <h2 className="feature-title fade-in-text" key={`title-${currentFeature}`}>
          {getNestedProperty(t, FEATURES[currentFeature].title)}
        </h2>
        <p className="feature-description fade-in-text" key={`desc-${currentFeature}`}>
          {getNestedProperty(t, FEATURES[currentFeature].description)}
        </p>

        <div className="slider-dots">
          {FEATURES.map((_, index) => (
            <button
              key={index}
              className={`slider-dot ${index === currentFeature ? 'active' : ''}`}
              onClick={() => setCurrentFeature(index)}
              aria-label={`Перейти к слайду ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="auth-bg-overlay"></div>
    </div>
  )
}

function getNestedProperty(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path
}
