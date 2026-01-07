import { useState, useEffect, useRef } from 'react';
import { currencyService, SUPPORTED_CURRENCIES, ProductPrices } from '../utils/currencyService';
import { getCurrentLanguage, type Language } from '../utils/translations/index';

interface CurrencyTranslation {
  symbol: string;
  code: string;
  priceLabel: string;
  prices: ProductPrices;
}

// Переводы для priceLabel по языкам
const PRICE_LABELS: Record<Language, string> = {
  ru: 'Цена',
  en: 'Price',
  uk: 'Ціна',
  pl: 'Cena',
  tr: 'Fiyat',
  kz: 'Баға'
};

export const useCurrencyTranslation = () => {
  const lastLanguageRef = useRef<Language>(getCurrentLanguage());
  
  const [currency, setCurrency] = useState<CurrencyTranslation>(() => {
    const language = getCurrentLanguage();
    const currencyCode = currencyService.getCurrencyByLanguage(language);
    const currencyInfo = SUPPORTED_CURRENCIES[currencyCode];
    
    return {
      symbol: currencyInfo.symbol,
      code: currencyInfo.code,
      priceLabel: PRICE_LABELS[language],
      prices: currencyService.getPricesForCurrency(currencyCode)
    };
  });

  const [isLoading, setIsLoading] = useState(false);

  // Автоматическое обновление валюты при изменении языка
  const updateCurrencyForLanguage = async (language: Language) => {
    setIsLoading(true);
    
    try {
      await currencyService.initialize();
      
      const currencyCode = currencyService.getCurrencyByLanguage(language);
      const currencyInfo = SUPPORTED_CURRENCIES[currencyCode];
      
      setCurrency({
        symbol: currencyInfo.symbol,
        code: currencyInfo.code,
        priceLabel: PRICE_LABELS[language],
        prices: currencyService.getPricesForCurrency(currencyCode)
      });
    } catch (error) {
      // Currency update error
    } finally {
      setIsLoading(false);
    }
  };

  // Инициализация при монтировании
  useEffect(() => {
    const initializeCurrency = async () => {
      const language = getCurrentLanguage();
      await updateCurrencyForLanguage(language);
    };

    initializeCurrency();
  }, []);

  // Автоматическое отслеживание изменения языка
  useEffect(() => {
    const checkLanguageChange = () => {
      const currentLanguage = getCurrentLanguage();
      
      if (currentLanguage !== lastLanguageRef.current) {
        lastLanguageRef.current = currentLanguage;
        updateCurrencyForLanguage(currentLanguage);
      }
    };

    window.addEventListener('storage', checkLanguageChange);
    
    const interval = setInterval(checkLanguageChange, 100);

    return () => {
      window.removeEventListener('storage', checkLanguageChange);
      clearInterval(interval);
    };
  }, []);

  return {
    currency,
    isLoading
  };
};