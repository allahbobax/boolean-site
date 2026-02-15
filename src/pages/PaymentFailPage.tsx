import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { getCurrentLanguage, Language } from '../utils/translations/index'
import '../styles/PaymentPage.css'

function PaymentFailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [lang, setLang] = useState<Language>(getCurrentLanguage())

  const orderId = searchParams.get('orderId')

  useEffect(() => {
    const handleStorageChange = () => setLang(getCurrentLanguage())
    window.addEventListener('storage', handleStorageChange)
    const interval = setInterval(() => {
      const newLang = getCurrentLanguage()
      if (newLang !== lang) setLang(newLang)
    }, 100)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [lang])

  return (
    <div className="home-page payment-page">
      <Navigation />

      <section className="payment-section">
        <div className="payment-card payment-fail">
          <div className="payment-icon fail">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h2>{lang === 'en' ? 'Payment failed' : 'Оплата не прошла'}</h2>
          <p>
            {lang === 'en' 
              ? 'Unfortunately, the payment was not completed. Please try again or choose a different payment method.' 
              : 'К сожалению, оплата не была завершена. Попробуйте ещё раз или выберите другой способ оплаты.'}
          </p>
          {orderId && (
            <p className="order-id">
              {lang === 'en' ? 'Order ID' : 'Номер заказа'}: {orderId}
            </p>
          )}
          <div className="payment-actions">
            <button onClick={() => navigate('/pricing')} className="payment-btn primary">
              {lang === 'en' ? 'Try Again' : 'Попробовать снова'}
            </button>
            <button onClick={() => navigate('/')} className="payment-btn secondary">
              {lang === 'en' ? 'Go Home' : 'На главную'}
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default PaymentFailPage
