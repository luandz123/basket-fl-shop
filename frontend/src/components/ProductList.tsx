'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { getProducts } from '@/lib/api';
import styles from './ProductList.module.css';

interface Product {
  id: number;
  name: string;
  price: number | string;
  image: string;
  categoryId?: number;
}

interface Category {
  id: number;
  name: string;
}

interface ProductListProps {
  initialProducts: Product[];
  initialCategories: Category[];
}

// Component that uses useSearchParams
function ProductListContent({ initialProducts, initialCategories }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  // Fix the unused variable warning by removing the setter
  const [categories] = useState<Category[]>(initialCategories);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Handle category filter from URL
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(parseInt(categoryParam));
    }
  }, [searchParams]);

  useEffect(() => {
    const loadProducts = async () => {
      if (initialProducts.length === 0) {
        try {
          setIsLoading(true);
          const params: Record<string, number> = { page: 1, limit: 20 };
          
          if (selectedCategory) {
            params.categoryId = selectedCategory;
          }
          
          const response = await getProducts(params);
          setProducts(response.data || []);
        } catch (error) {
          console.error('Error fetching products:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadProducts();
  }, [initialProducts, selectedCategory]);
  
  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    
    // Update URL without reloading the page
    const url = categoryId 
      ? `/products?category=${categoryId}`
      : '/products';
    
    router.push(url);
  };

  return (
    <div className={styles.container}>
      <div className={styles.categoryFilter}>
        <button
          className={`${styles.categoryButton} ${selectedCategory === null ? styles.active : ''}`}
          onClick={() => handleCategoryChange(null)}
        >
          All Products
        </button>
        
        {categories.map((category) => (
          <button
            key={category.id}
            className={`${styles.categoryButton} ${selectedCategory === category.id ? styles.active : ''}`}
            onClick={() => handleCategoryChange(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className={styles.loading}>Loading products...</div>
      ) : (
        <div className={styles.productGrid}>
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className={styles.noProducts}>
              No products found in this category.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Main component with Suspense
export default function ProductList(props: ProductListProps) {
  return (
    <Suspense fallback={
      <div className={styles.loading}>Loading products...</div>
    }>
      <ProductListContent {...props} />
    </Suspense>
  );
}