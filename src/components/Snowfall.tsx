import React, { useEffect, useMemo, useState } from 'react'
import '../styles/Snowfall.css'

type Snowflake = {
  id: number
  leftVw: number
  sizePx: number
  opacity: number
  blurPx: number
  durationS: number
  delayS: number
  swayPx: number
}

export default function Snowfall() {
  const enabled = false

  const flakes = useMemo<Snowflake[]>(() => {
    const count = 40 // было 120 - слишком много DOM-элементов
    const rand = (min: number, max: number) => min + Math.random() * (max - min)

    return Array.from({ length: count }, (_, idx) => ({
      id: idx,
      leftVw: rand(0, 100),
      sizePx: rand(2, 6),
      opacity: rand(0.25, 0.9),
      blurPx: rand(0, 1.2),
      durationS: rand(4.5, 10),
      delayS: rand(-15, 0),
      swayPx: rand(8, 40)
    }))
  }, [])

  const [reduceMotion, setReduceMotion] = useState(false)
  const [snowEnabled, setSnowEnabled] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check user settings for snow preference
    const loadSnowSettings = () => {
      const userSettings = localStorage.getItem('userSettings')
      if (userSettings) {
        try {
          const settings = JSON.parse(userSettings)
          setSnowEnabled(settings.snowEnabled !== undefined ? settings.snowEnabled : true)
        } catch (e) {
          // Failed to parse user settings
        }
      }
    }

    loadSnowSettings()

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userSettings') {
        loadSnowSettings()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    // Listen for custom events from settings changes in same tab
    const handleSettingsChange = () => {
      loadSnowSettings()
    }
    window.addEventListener('userSettingsChanged', handleSettingsChange)

    if (!window.matchMedia) return

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduceMotion(mql.matches)

    update()

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', update)
      return () => {
        mql.removeEventListener('change', update)
        window.removeEventListener('storage', handleStorageChange)
        window.removeEventListener('userSettingsChanged', handleSettingsChange)
      }
    }

    mql.addListener(update)
    return () => {
      mql.removeListener(update)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('userSettingsChanged', handleSettingsChange)
    }
  }, [])

  if (!enabled || reduceMotion || !snowEnabled) return null

  return (
    <div className="snowfall" aria-hidden="true">
      {flakes.map((f) => (
        <span
          key={f.id}
          className="snowfall__flake"
          style={
            {
              '--snow-left': `${f.leftVw}vw`,
              '--snow-size': `${f.sizePx}px`,
              '--snow-opacity': String(f.opacity),
              '--snow-blur': `${f.blurPx}px`,
              '--snow-duration': `${f.durationS}s`,
              '--snow-delay': `${f.delayS}s`,
              '--snow-sway': `${f.swayPx}px`
            } as React.CSSProperties
          }
        >
          <span className="snowfall__flakeInner" />
        </span>
      ))}
    </div>
  )
}
