import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.tsx'
import LoginPage from './pages/auth/LoginPage.tsx'
import RegisterPage from './pages/auth/RegisterPage.tsx'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.tsx'
import DashboardPage from './pages/dashboard/index.tsx'
import AdminPage from './pages/admin/AdminPage.tsx'
import PricingPage from './pages/PricingPage.tsx'
import PersonalDataPage from './pages/PersonalDataPage.tsx'
import UserAgreementPage from './pages/UserAgreementPage.tsx'
import UsageRulesPage from './pages/UsageRulesPage.tsx'
import LauncherAuthPage from './pages/LauncherAuthPage.tsx'
import DevTeamPage from './pages/DevTeamPage.tsx'
import NotFoundPage from './pages/NotFoundPage.tsx'
import BadGatewayPage from './pages/BadGatewayPage.tsx'
import { SoonModal } from './components/SoonModal'
import Snowfall from './components/Snowfall'
import { VerificationModal } from './pages/auth/components/VerificationModal'
import { NotificationType } from './types'
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
        <Route path="/auth" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/dashboard/*" element={<DashboardPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/pricing" element={<PricingPage />} />
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
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null)

  useEffect(() => {
    const openSoon = () => setShowSoonModal(true)
    window.addEventListener('openSoonModal', openSoon)
    return () => window.removeEventListener('openSoonModal', openSoon)
  }, [])

  useEffect(() => {
    // Global function to open verification modal
    (window as any).execute_verification_modal = (userId?: string) => {
      setPendingUserId(userId || 'test-user-id')
      setShowVerificationModal(true)
    }

    // Обработчик для тестового показа модалки
    const handleShowVerificationModal = (e: Event) => {
      const customEvent = e as CustomEvent<{ userId: string; email?: string }>;
      setPendingUserId(customEvent.detail.userId);
      setShowVerificationModal(true);
      
      if (customEvent.detail.email) {
        // Test modal: User verification
      }
    };

    window.addEventListener('showVerificationModal', handleShowVerificationModal as EventListener);

    return () => {
      delete (window as any).execute_verification_modal;
      window.removeEventListener('showVerificationModal', handleShowVerificationModal as EventListener);
    };
  }, [])

  return (
    <Router>
      <AppContent />
      {showSoonModal && (
        <SoonModal
          isOpen={showSoonModal}
          title="Soon..."
          message="Скоро"
          onClose={() => setShowSoonModal(false)}
        />
      )}

      {showVerificationModal && (
        <VerificationModal
          pendingUserId={pendingUserId}
          addNotification={(message, type) => setNotification({ message, type })}
          onClose={() => setShowVerificationModal(false)}
        />
      )}

      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 10000,
          background: notification.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          {notification.message}
          <button
            onClick={() => setNotification(null)}
            style={{
              marginLeft: '10px',
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ×
          </button>
        </div>
      )}
    </Router>
  )
}

export default App
