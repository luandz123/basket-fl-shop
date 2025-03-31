'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProductById, addToCart } from '@/lib/api';
import useAuth from '@/hooks/useAuth';
import SafeImage from '@/components/SafeImage';
import Link from 'next/link';
import styles from './page.module.css'

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

// Component using useParams
function ProductDetailContent() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showCartNotification, setShowCartNotification] = useState(false);

  const formatPrice = (price: number | string): string => {
    if (typeof price === 'string') {
      const numPrice = parseFloat(price);
      return isNaN(numPrice) ? price : numPrice.toFixed(2);
    }
    return price.toFixed(2);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        if (!id) return;
        const productData = await getProductById(Number(id));
        setProduct(productData);
      } catch (err) {
        console.error('Lỗi tải sản phẩm:', err);
        setError('Không tải được chi tiết sản phẩm.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };
  
  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };
  
  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!product) return;
    
    try {
      setIsAdding(true);
      await addToCart({
        productId: product.id,
        quantity: quantity
      });
      
      // Show notification
      setShowCartNotification(true);
      // Hide it after 3 seconds
      setTimeout(() => {
        setShowCartNotification(false);
      }, 3000);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Không thể thêm vào giỏ hàng. Vui lòng thử lại sau.');
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loaderContainer}>
        <div className={styles.loader}></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.container}>
        <div className={styles.errorBox}>
          {error || 'Không tìm thấy sản phẩm.'}
        </div>
        <div style={{ marginTop: '1rem' }}>
          <Link href="/products" className={styles.backLink}>
            ← Quay lại sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {showCartNotification && (
        <div className={styles.notification}>
          Sản phẩm đã được thêm vào giỏ hàng!
        </div>
      )}
      
      <div className={styles.breadcrumbs}>
        <Link href="/" className={styles.breadcrumbLink}>Trang chủ</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <Link href="/products" className={styles.breadcrumbLink}>Sản phẩm</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbActive}>{product.name}</span>
      </div>
      
      <div className={styles.productLayout}>
        <div className={styles.productImage}>
          <SafeImage
            src={product.image}
            alt={product.name}
          />
        </div>
        
        <div className={styles.productInfo}>
          <h1 className={styles.productTitle}>{product.name}</h1>
          
          {product.category && (
            <div className={styles.categoryTag}>
              {product.category.name}
            </div>
          )}
          
          <div className={styles.productPrice}>
            ${formatPrice(product.price)}
          </div>
          
          <div className={styles.productDescription}>
            <p>{product.description || 'Không có mô tả chi tiết cho sản phẩm này.'}</p>
          </div>
          
          <div className={styles.quantitySelector}>
            <button 
              onClick={handleDecrement}
              className={styles.quantityButton}
              disabled={isAdding || quantity <= 1}
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              className={styles.quantityInput}
              disabled={isAdding}
            />
            <button 
              onClick={handleIncrement}
              className={styles.quantityButton}
              disabled={isAdding}
            >
              +
            </button>
          </div>
          
          <button 
            onClick={handleAddToCart}
            className={styles.addToCartButton}
            disabled={isAdding}
          >
            {isAdding ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense
export default function ProductDetailPage() {
  return (
    <Suspense fallback={
      <div className={styles.loaderContainer}>
        <div className={styles.loader}></div>
      </div>
    }>
      <ProductDetailContent />
    </Suspense>
  );
}