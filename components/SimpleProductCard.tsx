'use client';

import { DollarSign, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SimpleProductCardProps {
  products: Array<{
    name: string;
    price: number;
    image: string;
    rating?: number;
    winner?: boolean;
  }>;
}

export function SimpleProductCard({ products }: SimpleProductCardProps) {
  const t = useTranslations('products');
  return (
    <div className="flex gap-4 justify-center my-4">
      {products.map((product, index) => (
        <div
          key={index}
          className={`flex flex-col items-center p-4 bg-white rounded-xl shadow-md border-2 ${
            product.winner ? 'border-green-400 bg-green-50' : 'border-gray-200'
          } relative`}
        >
          {product.winner && (
            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
              {t('bestChoice')}
            </div>
          )}
          
          <div className="text-4xl mb-2">{product.image}</div>
          <h4 className="font-semibold text-sm text-gray-800">{product.name}</h4>
          <div className="flex items-center gap-1 mt-1">
            <DollarSign className="w-3 h-3 text-green-600" />
            <span className="font-bold text-green-600">{product.price}</span>
          </div>
          {product.rating && (
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-xs text-gray-600">{product.rating}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}