import { useCurrencyTranslation } from '../hooks/useCurrencyTranslation';
import '../styles/PriceDisplay.css';

interface PriceDisplayProps {
  productId: 'client30' | 'client90' | 'clientLifetime' | 'hwidReset' | 'premium30' | 'alpha';
  className?: string;
  showCurrency?: boolean;
  originalPrice?: number; // Для отображения скидки
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ 
  productId, 
  className = '', 
  showCurrency = true,
  originalPrice 
}) => {
  const { currency, isLoading } = useCurrencyTranslation();
  
  const price = currency.prices[productId];
  const hasDiscount = originalPrice && originalPrice > price;

  if (isLoading) {
    return (
      <div className={`price-display loading ${className}`}>
        <span className="price-skeleton">---</span>
      </div>
    );
  }

  return (
    <div className={`price-display ${className}`}>
      {hasDiscount && (
        <span className="price-original">
          {originalPrice} {showCurrency && currency.symbol}
        </span>
      )}
      <span className="price-current">
        {price} {showCurrency && currency.symbol}
      </span>
    </div>
  );
};

export default PriceDisplay;