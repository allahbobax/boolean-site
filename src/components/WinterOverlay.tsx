import React, { useEffect, useMemo, useState } from 'react'
import '../styles/WinterOverlay.css'

type Star = {
  id: number
  topVh: number
  leftVw: number
  sizePx: number
  opacity: number
  durationS: number
  delayS: number
  blurPx: number
}

export default function WinterOverlay() {
  const enabled = (import.meta as any)?.env?.VITE_WINTER_OVERLAY !== 'true'

  const [reduceMotion, setReduceMotion] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const motionMql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mobileMql = window.matchMedia('(max-width: 640px)')

    const updateMotion = () => setReduceMotion(motionMql.matches)
    const updateMobile = () => setIsMobile(mobileMql.matches)

    updateMotion()
    updateMobile()

    if (typeof motionMql.addEventListener === 'function') {
      motionMql.addEventListener('change', updateMotion)
      mobileMql.addEventListener('change', updateMobile)
      return () => {
        motionMql.removeEventListener('change', updateMotion)
        mobileMql.removeEventListener('change', updateMobile)
      }
    }

    motionMql.addListener(updateMotion)
    mobileMql.addListener(updateMobile)
    return () => {
      motionMql.removeListener(updateMotion)
      mobileMql.removeListener(updateMobile)
    }
  }, [])

  const stars = useMemo<Star[]>(() => {
    const count = isMobile ? 18 : 34
    const rand = (min: number, max: number) => min + Math.random() * (max - min)

    return Array.from({ length: count }, (_, idx) => ({
      id: idx,
      topVh: rand(0, 100),
      leftVw: rand(0, 100),
      sizePx: rand(1, 2.4),
      opacity: rand(0.2, 0.75),
      durationS: rand(2.8, 6.5),
      delayS: rand(-6.5, 0),
      blurPx: rand(0, 0.8)
    }))
  }, [isMobile])

  if (!enabled) return null

  return (
    <div className="winterOverlay" aria-hidden="true">
      <div className="winterOverlay__glow" />
      <div className="winterOverlay__garlands">
        <div className="winterOverlay__garlandEdge winterOverlay__garlandEdge--top" />
        <div className="winterOverlay__garlandEdge winterOverlay__garlandEdge--right" />
        <div className="winterOverlay__garlandEdge winterOverlay__garlandEdge--bottom" />
        <div className="winterOverlay__garlandEdge winterOverlay__garlandEdge--left" />
      </div>
      {!reduceMotion && (
        <div className="winterOverlay__twinkles">
          {stars.map((s) => (
            <span
              key={s.id}
              className="winterOverlay__star"
              style={
                {
                  '--tw-top': `${s.topVh}vh`,
                  '--tw-left': `${s.leftVw}vw`,
                  '--tw-size': `${s.sizePx}px`,
                  '--tw-opacity': String(s.opacity),
                  '--tw-duration': `${s.durationS}s`,
                  '--tw-delay': `${s.delayS}s`,
                  '--tw-blur': `${s.blurPx}px`
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
