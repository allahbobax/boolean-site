import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { getCurrentLanguage, Language } from '../utils/translations/index'
import '../styles/PaymentPage.css'

function PaymentSuccessPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [lang, setLang] = useState<Language>(getCurrentLanguage())
  const [orderStatus, setOrderStatus] = useState<'loading' | 'success' | 'error'>('loading')

  const orderId = searchParams.get('orderId')

  useEffect(() => {
    const checkOrderStatus = async () => {
      if (!orderId) {
        setOrderStatus('success')
        return
      }

      try {
        const response = await fetch(`https://api.booleanclient.online/payments/order-status/${orderId}`, {
          headers: {
            'X-API-Key': import.meta.env.VITE_INTERNAL_API_KEY || '',
          },
        })
        const data = await response.json()

        if (data.success && data.data?.status === 'completed') {
          setOrderStatus('success')
        } else {
          setOrderStatus('success') // Показываем успех даже если статус pending (webhook может прийти позже)
        }
      } catch {
        setOrderStatus('success')
      }
    }

    checkOrderStatus()
  }, [orderId])

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
        <div className="payment-card payment-success">
          {orderStatus === 'loading' ? (
            <>
              <div className="payment-icon loading">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <h2>{lang === 'en' ? 'Checking payment...' : 'Проверяем оплату...'}</h2>
            </>
          ) : (
            <>
              <div className="payment-icon success">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2>{lang === 'en' ? 'Payment successful!' : 'Оплата прошла успешно!'}</h2>
              <p>
                {lang === 'en' 
                  ? 'Your subscription has been activated. Thank you for your purchase!' 
                  : 'Ваша подписка активирована. Спасибо за покупку!'}
              </p>
              <div className="payment-actions">
                <button onClick={() => navigate('/dashboard')} className="payment-btn primary">
                  {lang === 'en' ? 'Go to Dashboard' : 'Перейти в личный кабинет'}
                </button>
                <button onClick={() => navigate('/')} className="payment-btn secondary">
                  {lang === 'en' ? 'Go Home' : 'На главную'}
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default PaymentSuccessPage
