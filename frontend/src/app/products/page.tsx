import React from 'react';
import { getProducts } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';
import styles from './page.module.css';

export default async function ProductsPage() {
  const { data: products } = await getProducts({ page: 1, limit: 10 });

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Sản phẩm của chúng tôi</h1>
      {products && products.length > 0 ? (
        <div className={styles.grid}>
          {products.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p>Không có sản phẩm nào</p>
      )}
    </div>
  );
}