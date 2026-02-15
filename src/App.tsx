import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.tsx'
import AuthPage from './pages/auth/AuthPage.tsx'
import DashboardPage from './pages/dashboard/index.tsx'
import AdminPage from './pages/admin/AdminPage.tsx'
import PricingPage from './pages/PricingPage.tsx'
import PaymentSuccessPage from './pages/PaymentSuccessPage.tsx'
import PaymentFailPage from './pages/PaymentFailPage.tsx'
import PersonalDataPage from './pages/PersonalDataPage.tsx'
import UserAgreementPage from './pages/UserAgreementPage.tsx'
import UsageRulesPage from './pages/UsageRulesPage.tsx'
import LauncherAuthPage from './pages/LauncherAuthPage.tsx'
import DevTeamPage from './pages/DevTeamPage.tsx'
import NotFoundPage from './pages/NotFoundPage.tsx'
import BadGatewayPage from './pages/BadGatewayPage.tsx'
import { SoonModal } from './components/SoonModal'
import Snowfall from './components/Snowfall'
import { CloudflareCheck } from './components/CloudflareCheck'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp.tsx'
import './styles/auth/AuthModal.css'

// Wrapper component inside Router context
function AppContent() {
  useKeyboardShortcuts()
  
  return (
    <>
      <Snowfall />
      <KeyboardShortcutsHelp />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard/*" element={<DashboardPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/fail" element={<PaymentFailPage />} />
        <Route path="/personal-data" element={<PersonalDataPage />} />
        <Route path="/user-agreement" element={<UserAgreementPage />} />
        <Route path="/usage-rules" element={<UsageRulesPage />} />
        <Route path="/launcher-auth" element={<LauncherAuthPage />} />
        <Route path="/dev-team" element={<DevTeamPage />} />
        <Route path="/502" element={<BadGatewayPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

function App() {
  const [showSoonModal, setShowSoonModal] = useState(false)
  const [isVerified, setIsVerified] = useState(() => {
    // В режиме разработки можно пропустить проверку, если ключ не настроен
    if (import.meta.env.DEV && !import.meta.env.VITE_TURNSTILE_SITE_KEY) {
      return true
    }
    return sessionStorage.getItem('cf_verified') === 'true'
  })

  useEffect(() => {
    const openSoon = () => setShowSoonModal(true)
    window.addEventListener('openSoonModal', openSoon)
    return () => window.removeEventListener('openSoonModal', openSoon)
  }, [])

  if (!isVerified) {
    return (
      <CloudflareCheck 
        onVerified={() => {
          sessionStorage.setItem('cf_verified', 'true')
          setIsVerified(true)
        }} 
      />
    )
  }

  return (
    <Router>
      <div style={{ display: 'none' }} data-version="1.0.1-rev-3"></div>
      <AppContent />
      {showSoonModal && (
        <SoonModal
          isOpen={showSoonModal}
          title="Soon..."
          message="Скоро"
          onClose={() => setShowSoonModal(false)}
        />
      )}
    </Router>
  )
}

export default App
