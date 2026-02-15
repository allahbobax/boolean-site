import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer.tsx'
import Navigation from '../components/Navigation.tsx'
import { IconShoppingBag } from '../components/Icons'
import '../styles/PricingPage.css'
import { fetchProducts, PRODUCTS_FALLBACK, Product } from '../utils/constants.ts'
import { getTranslation, getCurrentLanguage, Language } from '../utils/translations/index.ts'
import { useCurrencyTranslation } from '../hooks/useCurrencyTranslation'

import { getCurrentUser } from '../utils/database'

function PricingPage() {
  const navigate = useNavigate()
  const [lang, setLang] = useState<Language>(getCurrentLanguage())
  const [products, setProducts] = useState<Product[]>(PRODUCTS_FALLBACK)
  const { currency } = useCurrencyTranslation()
  const t = getTranslation(lang)

  useEffect(() => {
    fetchProducts().then(data => {
      if (data.length > 0) {
        setProducts(data)
      }
    })
  }, [])

  useEffect(() => {
    const handleStorageChange = () => {
      setLang(getCurrentLanguage())
    }
    window.addEventListener('storage', handleStorageChange)

    const interval = setInterval(() => {
      const newLang = getCurrentLanguage()
      if (newLang !== lang) {
        setLang(newLang)
      }
    }, 100)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [lang])

  // Функция для получения изображения продукта с учетом языка
  const getProductImage = (productId: string): string => {
    const suffix = lang === 'en' ? '-eng.jpg' : '.jpg'

    if (productId === 'alpha') return `/alpha.jpg`
    if (productId === 'premium-30') return `/premium30days${suffix}`
    if (productId === 'client-30') return `/30days${suffix}`
    if (productId === 'client-90') return `/90days${suffix}`
    if (productId === 'client-lifetime') return `/forever${suffix}`
    if (productId === 'hwid-reset') return `/remove${suffix}`
    return '/photo.png' // fallback изображение
  }

  // Функция для получения локализованного названия продукта
  const getLocalizedProductName = (productId: string): string => {
    const productMap: Record<string, keyof typeof t.products> = {
      'client-30': 'client30',
      'client-90': 'client90',
      'client-lifetime': 'clientLifetime',
      'hwid-reset': 'hwidReset',
      'premium-30': 'premium30',
      'alpha': 'alpha'
    }
    const key = productMap[productId]
    return key ? t.products[key] : productId
  }

  // Функция для получения локализованной цены
  const getLocalizedPrice = (productId: string): number => {
    const priceMap: Record<string, keyof typeof currency.prices> = {
      'client-30': 'client30',
      'client-90': 'client90',
      'client-lifetime': 'clientLifetime',
      'hwid-reset': 'hwidReset',
      'premium-30': 'premium30',
      'alpha': 'alpha'
    }
    const key = priceMap[productId]
    return key ? currency.prices[key] : 0
  }

  const handlePay = async (product: Product) => {
    const user = getCurrentUser()
    if (!user) {
      navigate('/auth')
      return
    }

    try {
      const response = await fetch('https://api.booleanclient.online/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': import.meta.env.VITE_INTERNAL_API_KEY || '',
        },
        body: JSON.stringify({
          productId: product.id,
          userId: user.id,
          email: user.email,
        }),
      })

      const data = await response.json()

      if (data.success && data.data?.paymentUrl) {
        window.location.href = data.data.paymentUrl
      } else {
        console.error('Payment error:', data.message)
        alert(lang === 'en' ? 'Ошибка при создании платежа' : 'Payment creation error')
      }
    } catch (error) {
      console.error('Payment request error:', error)
      alert(lang === 'en' ? 'Payment creation error' : 'Ошибка при создании платежа')
    }
  }

  return (
    <div className="home-page pricing-page">
      <Navigation />

      <section className="pricing-section">
        <h2 className="pricing-title">{t.services.title}</h2>

        <div className="pricing-grid">
          {products.map((product) => {
            const hasDiscount = 'discount' in product && (product as { discount?: number }).discount
            const localizedPrice = getLocalizedPrice(product.id)
            const localizedName = getLocalizedProductName(product.id)

            return (
              <div key={product.id} className="pricing-card">
                <div className="pricing-card-image">
                  <img
                    src={getProductImage(product.id)}
                    alt={localizedName}
                    className="pricing-card-img"
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                  />
                </div>

                <div className="pricing-card-content">
                  <h3 className="pricing-card-name">{localizedName}</h3>

                  <div className="pricing-card-price">
                    <span className="pricing-card-price-label">{currency.priceLabel}:</span>
                    <span className="pricing-card-price-current">{localizedPrice} {currency.symbol}</span>
                    {hasDiscount && (
                      <span className="pricing-discount-badge">
                        {t.services.discount} {(product as { discount?: number }).discount}%
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handlePay(product)}
                    className="pricing-card-button"
                  >
                    <IconShoppingBag />
                    {t.services.pay}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default PricingPage
