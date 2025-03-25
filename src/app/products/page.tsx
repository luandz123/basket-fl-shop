import React from 'react';
import { getProducts } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';

export default async function ProductsPage() {
  const { data: products } = await getProducts({ page: 1, limit: 10 });

  return (
    <div>
      <h1>Our Products</h1>
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p>No products available</p>
      )}
    </div>
  );
}
