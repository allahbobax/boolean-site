interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
}

// Поддерживаемые валюты
export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  RUB: { code: 'RUB', symbol: '₽', name: 'Российский рубль' },
  USD: { code: 'USD', symbol: '$', name: 'Доллар США' },
  EUR: { code: 'EUR', symbol: '€', name: 'Евро' },
  UAH: { code: 'UAH', symbol: '₴', name: 'Украинская гривна' },
  KZT: { code: 'KZT', symbol: '₸', name: 'Казахстанский тенге' },
  PLN: { code: 'PLN', symbol: 'zł', name: 'Польский злотый' },
  TRY: { code: 'TRY', symbol: '₺', name: 'Турецкая лира' }
};

// Тип для цен продуктов
export interface ProductPrices {
  client30: number;
  client90: number;
  clientLifetime: number;
  hwidReset: number;
  premium30: number;
  alpha: number;
}

// Базовые цены в рублях
const BASE_PRICES_RUB: ProductPrices = {
  client30: 199,
  client90: 449,
  clientLifetime: 999,
  hwidReset: 99,
  premium30: 299,
  alpha: 599
};

class CurrencyService {
  private exchangeRates: Record<string, number> = {};
  private lastUpdate: number = 0;
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 час
  // Используем v6 API с ключом из .env для актуальных курсов
  private readonly API_URL = import.meta.env.VITE_EXCHANGE_API_URL || 'https://v6.exchangerate-api.com/v6/99c7cccc8a4e6c30d7918e45/latest/RUB';

  constructor() {
    this.loadCachedRates();
  }

  // Загрузка курсов из localStorage
  private loadCachedRates(): void {
    try {
      const cached = localStorage.getItem('currency_rates');
      const lastUpdate = localStorage.getItem('currency_last_update');
      
      if (cached && lastUpdate) {
        this.exchangeRates = JSON.parse(cached);
        this.lastUpdate = parseInt(lastUpdate);
      }
    } catch (error) {
      // Ignore cache load errors
    }
  }

  // Сохранение курсов в localStorage
  private saveCachedRates(): void {
    try {
      localStorage.setItem('currency_rates', JSON.stringify(this.exchangeRates));
      localStorage.setItem('currency_last_update', this.lastUpdate.toString());
    } catch (error) {
      // Ignore cache save errors
    }
  }

  // Проверка актуальности курсов
  private isRatesExpired(): boolean {
    return Date.now() - this.lastUpdate > this.CACHE_DURATION;
  }

  // Получение курсов валют с API
  async fetchExchangeRates(): Promise<void> {
    try {
      const response = await fetch(this.API_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // v6 API возвращает result: 'success' и conversion_rates
      // v4 API возвращает rates напрямую
      if (data.result === 'success' && data.conversion_rates) {
        this.exchangeRates = data.conversion_rates;
        this.lastUpdate = Date.now();
        this.saveCachedRates();
      } else if (data.rates) {
        // Fallback для v4 API
        this.exchangeRates = data.rates;
        this.lastUpdate = Date.now();
        this.saveCachedRates();
      } else {
        throw new Error('API вернул неожиданный формат данных');
      }
    } catch (error) {
      // Если нет кэшированных данных, используем fallback курсы
      if (Object.keys(this.exchangeRates).length === 0) {
        this.setFallbackRates();
      }
    }
  }

  // Fallback курсы (приблизительные)
  private setFallbackRates(): void {
    this.exchangeRates = {
      USD: 0.010,
      EUR: 0.009,
      UAH: 0.41,
      KZT: 5.0,
      PLN: 0.041,
      TRY: 0.35,
      RUB: 1.0
    };
    this.lastUpdate = Date.now();
    this.saveCachedRates();
  }

  // Получение курса для валюты
  getExchangeRate(currencyCode: string): number {
    return this.exchangeRates[currencyCode] || 1;
  }

  // Конвертация цены из рублей в другую валюту
  convertPrice(priceInRub: number, targetCurrency: string): number {
    if (targetCurrency === 'RUB') {
      return priceInRub;
    }

    const rate = this.getExchangeRate(targetCurrency);
    const convertedPrice = priceInRub * rate;
    
    // Округление до разумных значений
    if (convertedPrice < 1) {
      return Math.round(convertedPrice * 100) / 100; // 2 знака после запятой
    } else if (convertedPrice < 10) {
      return Math.round(convertedPrice * 10) / 10; // 1 знак после запятой
    } else {
      return Math.round(convertedPrice); // Целое число
    }
  }

  // Получение всех цен для определенной валюты
  getPricesForCurrency(currencyCode: string): ProductPrices {
    return {
      client30: this.convertPrice(BASE_PRICES_RUB.client30, currencyCode),
      client90: this.convertPrice(BASE_PRICES_RUB.client90, currencyCode),
      clientLifetime: this.convertPrice(BASE_PRICES_RUB.clientLifetime, currencyCode),
      hwidReset: this.convertPrice(BASE_PRICES_RUB.hwidReset, currencyCode),
      premium30: this.convertPrice(BASE_PRICES_RUB.premium30, currencyCode),
      alpha: this.convertPrice(BASE_PRICES_RUB.alpha, currencyCode)
    };
  }

  // Инициализация сервиса
  async initialize(): Promise<void> {
    if (this.isRatesExpired()) {
      await this.fetchExchangeRates();
    }
  }

  // Принудительное обновление курсов
  async forceUpdate(): Promise<void> {
    await this.fetchExchangeRates();
  }

  // Получение информации о валюте
  getCurrencyInfo(currencyCode: string): CurrencyConfig | null {
    return SUPPORTED_CURRENCIES[currencyCode] || null;
  }

  // Получение списка поддерживаемых валют
  getSupportedCurrencies(): CurrencyConfig[] {
    return Object.values(SUPPORTED_CURRENCIES);
  }

  // Определение валюты по языку
  getCurrencyByLanguage(language: string): string {
    const languageToCurrency: Record<string, string> = {
      'ru': 'RUB',
      'en': 'USD',
      'uk': 'UAH',
      'kz': 'KZT',
      'pl': 'PLN',
      'tr': 'TRY'
    };
    
    return languageToCurrency[language] || 'USD';
  }
}

// Экспорт единственного экземпляра
export const currencyService = new CurrencyService();

// Хук для использования в React компонентах
export const useCurrency = () => {
  return {
    convertPrice: (price: number, currency: string) => currencyService.convertPrice(price, currency),
    getPricesForCurrency: (currency: string) => currencyService.getPricesForCurrency(currency),
    getCurrencyInfo: (currency: string) => currencyService.getCurrencyInfo(currency),
    getSupportedCurrencies: () => currencyService.getSupportedCurrencies(),
    getCurrencyByLanguage: (language: string) => currencyService.getCurrencyByLanguage(language),
    forceUpdate: () => currencyService.forceUpdate()
  };
};