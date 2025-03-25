'use client';

import React from 'react';
import Link from 'next/link';
import SafeImage from './SafeImage';

interface Product {
  id: number;
  name: string;
  price: number | string;
  image: string;
  description?: string;
  categoryId?: number;
  category?: {
    id: number;
    name: string;
  };
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Đảm bảo price là số
  const formatPrice = (price: number | string): string => {
    if (typeof price === 'string') {
      // Chuyển đổi chuỗi sang số
      const numPrice = parseFloat(price);
      return isNaN(numPrice) ? price.toString() : numPrice.toFixed(2);
    } else {
      return price.toFixed(2);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <Link href={`/products/${product.id}`}>
        <div className="aspect-square overflow-hidden">
          <SafeImage
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="font-medium text-lg mb-2 text-gray-800">{product.name}</h3>
          {product.category && (
            <div className="mb-2">
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                {product.category.name}
              </span>
            </div>
          )}
        </div>
      </Link>
      <div className="px-4 pb-4">
        <div className="flex justify-between items-center">
          <p className="font-semibold text-green-600">${formatPrice(product.price)}</p>
          <Link 
            href={`/products/${product.id}`}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors text-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;