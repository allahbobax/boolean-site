import { useState, useEffect } from 'react'
import '../styles/PaymentModal.css'
import { fetchProducts, PRODUCTS_FALLBACK, Product } from '../utils/constants'
import { getTranslation, getCurrentLanguage, Language } from '../utils/translations/index'
import { IconClose } from './Icons'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  productId?: string
}

function PaymentModal({ isOpen, onClose, productId }: PaymentModalProps) {
  const [selectedProduct, setSelectedProduct] = useState(productId || '')
  const [promoCode, setPromoCode] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'youkassa' | 'funpay' | ''>('')
  const [lang, setLang] = useState<Language>(getCurrentLanguage())
  const [products, setProducts] = useState<Product[]>(PRODUCTS_FALLBACK)
  const t = getTranslation(lang)

  // Загрузка продуктов с API
  useEffect(() => {
    fetchProducts().then(data => {
      if (data.length > 0) {
        setProducts(data)
      }
    })
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const newLang = getCurrentLanguage()
      if (newLang !== lang) setLang(newLang)
    }, 100)
    return () => clearInterval(interval)
  }, [lang])

  if (!isOpen) return null

  const product = products.find(p => p.id === selectedProduct)
  
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
    const priceMap: Record<string, keyof typeof t.currency.prices> = {
      'client-30': 'client30',
      'client-90': 'client90',
      'client-lifetime': 'clientLifetime',
      'hwid-reset': 'hwidReset',
      'premium-30': 'premium30',
      'alpha': 'alpha'
    }
    const key = priceMap[productId]
    return key ? t.currency.prices[key] : 0
  }

  const finalPrice = product ? getLocalizedPrice(product.id) : 0

  const handlePayment = () => {
    if (!selectedProduct || !paymentMethod) {
      alert('Выберите товар и способ оплаты')
      return
    }

    if (paymentMethod === 'youkassa') {
      alert('Перенаправление на оплату через ЮKassa...')
    } else if (paymentMethod === 'funpay') {
      alert('Перенаправление на FunPay...')
    }
  }

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <IconClose size={24} />
        </button>

        <h2 className="modal-title">{t.payment.title}</h2>

        {/* Выбор товара */}
        <div className="modal-section">
          <label className="modal-label">{t.payment.selectProduct}</label>
          <select 
            className="modal-select"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="">{t.payment.selectPlaceholder}</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {getLocalizedProductName(p.id)} - {getLocalizedPrice(p.id)} {t.currency.symbol}
                {p.discount && ` (${t.services.discount} ${p.discount}%)`}
              </option>
            ))}
          </select>
        </div>

        {/* Промокод */}
        <div className="modal-section">
          <label className="modal-label">{t.payment.promo}</label>
          <input
            type="text"
            className="modal-input"
            placeholder={t.payment.promoPlaceholder}
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
          />
        </div>

        {/* Итоговая цена */}
        {product && (
          <div className="price-summary">
            <div className="price-row">
              <span>{t.payment.toPay}:</span>
              <span className="price-amount">
                <span className="price-final">{finalPrice} {t.currency.symbol}</span>
                {'discount' in product && (product as { discount?: number }).discount && (
                  <span className="price-discount">{t.services.discount} {(product as { discount?: number }).discount}%</span>
                )}
              </span>
            </div>
          </div>
        )}

        {/* Способы оплаты */}
        <div className="modal-section">
          <label className="modal-label">{t.payment.paymentMethod}</label>
          <div className="payment-methods">
            <button
              className={`payment-method ${paymentMethod === 'youkassa' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('youkassa')}
            >
              <div className="payment-icon">💳</div>
              <div className="payment-info">
                <div className="payment-name">ЮKassa</div>
                <div className="payment-desc">{t.payment.cards}</div>
              </div>
            </button>

            <button
              className={`payment-method ${paymentMethod === 'funpay' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('funpay')}
            >
              <div className="payment-icon">🎮</div>
              <div className="payment-info">
                <div className="payment-name">FunPay</div>
                <div className="payment-desc">{t.payment.gameMarket}</div>
              </div>
            </button>
          </div>
        </div>

        {/* Кнопка оплаты */}
        <button 
          className="payment-button"
          onClick={handlePayment}
          disabled={!selectedProduct || !paymentMethod}
        >
          {t.payment.continue}
        </button>

        <div className="payment-note">
          {t.payment.note}
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
