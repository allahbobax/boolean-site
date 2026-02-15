import Navigation from '../components/Navigation.tsx'
import HeroSection from '../components/HeroSection.tsx'
import FeaturesSection from '../components/FeaturesSection.tsx'
import Footer from '../components/Footer.tsx'
import DecorativeElements from '../components/DecorativeElements.tsx'
import '../styles/home/index.css'
import { useTheme } from '../hooks/useTheme'

function HomePage() {
  const theme = useTheme()
  const isDark = theme !== 'light'

  return (
    <div className={`min-h-screen relative overflow-x-hidden ${isDark ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
      <DecorativeElements />
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </div>
  )
}

export default HomePage
