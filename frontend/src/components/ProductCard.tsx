'use client';

import React from 'react';
import Link from 'next/link';
import SafeImage from './SafeImage';
import styles from './ProductCard.module.css';

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
  // Format price ensuring it shows 2 decimals
  const formatPrice = (price: number | string): string => {
    if (typeof price === 'string') {
      const numPrice = parseFloat(price);
      return isNaN(numPrice) ? price.toString() : numPrice.toFixed(2);
    } else {
      return price.toFixed(2);
    }
  };

  return (
    <div className={styles.card}>
      <Link href={`/products/${product.id}`}>
        <div className={styles.imageContainer}>
          <SafeImage
            src={product.image}
            alt={product.name}
            className={styles.image}
          />
        </div>
        <div className={styles.info}>
          <h3 className={styles.title}>{product.name}</h3>
          {product.category && (
            <div className={styles.categoryWrapper}>
              <span className={styles.category}>
                {product.category.name}
              </span>
            </div>
          )}
        </div>
      </Link>
      <div className={styles.footer}>
        <div className={styles.footerRow}>
          <p className={styles.price}>${formatPrice(product.price)}</p>
          <Link 
            href={`/products/${product.id}`}
            className={styles.viewButton}
          >
            Xem chi tiết 
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;