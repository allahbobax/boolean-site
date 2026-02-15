import { useState, useEffect } from 'react'
import { FEATURES } from '../constants/features'

export function useFeatureSlider() {
  const [currentFeature, setCurrentFeature] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % FEATURES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return { currentFeature, setCurrentFeature }
}
