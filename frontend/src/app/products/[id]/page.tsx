'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProductById, addToCart } from '@/lib/api';
import useAuth from '@/hooks/useAuth';
import SafeImage from '@/components/SafeImage';
import Link from 'next/link';
import styles from './page.module.css';

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

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
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
        const productData = await getProductById(Number(id));
        setProduct(productData);
      } catch (error) {
        console.error('Lỗi tải sản phẩm:', error);
        setError('Không tải được chi tiết sản phẩm.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!product) return;
    setIsAdding(true);
    try {
      await addToCart(product.id, quantity);
      setShowCartNotification(true);
      setTimeout(() => {
        setShowCartNotification(false);
      }, 5000);
    } catch (error) {
      console.error('Lỗi thêm vào giỏ hàng:', error);
      setError('Thêm sản phẩm vào giỏ hàng thất bại.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!product) return;
    setIsAdding(true);
    try {
      await addToCart(product.id, quantity);
      router.push('/checkout');
    } catch (error) {
      console.error('Lỗi mua ngay:', error);
      setError('Xử lý yêu cầu mua ngay thất bại.');
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
      {/* Thông báo khi sản phẩm được thêm vào giỏ hàng */}
      {showCartNotification && (
        <div className={styles.notification}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <svg className={styles.icon} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <span>
                <strong>{product.name}</strong> đã được thêm vào giỏ hàng!
              </span>
            </div>
            <button 
              onClick={() => setShowCartNotification(false)}
              className={styles.closeButton}
            >
              ×
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem' }}>
            <Link 
              href="/cart" 
              className={styles.viewCartButton}
            >
              Xem giỏ hàng
            </Link>
            <button 
              className={styles.continueButton}
              onClick={() => setShowCartNotification(false)}  
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      )}

      <div className={styles.detailWrapper}>
        <div className={styles.detailRow}>
          {/* Hình ảnh sản phẩm */}
          <div className={styles.imageSection}>
            <div className={styles.imageContainer}>
              <SafeImage
                src={product.image}
                alt={product.name}
                className={styles.image}
              />
            </div>
          </div>
          
          {/* Thông tin sản phẩm */}
          <div className={styles.infoSection}>
            <div style={{ marginBottom: '0.5rem' }}>
              {product.category && (
                <Link 
                  href={`/products?category=${product.category.id}`}
                  className={styles.categoryLink}
                >
                  {product.category.name}
                </Link>
              )}
            </div>
            
            <h1 className={styles.productTitle}>{product.name}</h1>
            <p className={styles.price}>${formatPrice(product.price)}</p>
            
            {product.description && (
              <div className={styles.descriptionSection}>
                <h2 className={styles.descriptionHeading}>Mô tả</h2>
                <p className={styles.descriptionText}>{product.description}</p>
              </div>
            )}
            
            {/* Bộ chọn số lượng */}
            <div className={styles.quantitySelector}>
              <label htmlFor="quantity" className={styles.quantityLabel}>
                Số lượng
              </label>
              <div className={styles.quantityControl}>
                <button 
                  className={styles.quantityButton}
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                >
                  -
                </button>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className={styles.quantityInput}
                  min="1"
                />
                <button 
                  className={styles.quantityButton}
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Nút Thêm vào giỏ hàng và Mua ngay */}
            <div className={styles.actionButtons}>
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className={styles.addButton}
              >
                {isAdding ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isAdding}
                className={styles.buyNowButton}
              >
                Mua ngay
              </button>
            </div>
            
            {/* Thông tin giao hàng */}
            <div className={styles.shippingInfo}>
              <div className={styles.shippingItem}>
                <svg className={styles.shippingIcon} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1 1 0 11-3 0 1.5 1.5 0 013 0z"/>
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H11a1 1 0 001-1v-5h2.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-5a1 1 0 00-1-1h-1.05A2.5 2.5 0 0016 1.95V1a1 1 0 00-1-1H5a1 1 0 00-1 1v.95A2.5 2.5 0 001.05 4H1zm14 8h-3.05a2.5 2.5 0 00-4.9 0H3V5h1.05a2.5 2.5 0 004.9 0H15v7z"/>
                </svg>
                <span className={styles.shippingText}>Miễn phí vận chuyển</span>
              </div>
              <div className={styles.shippingItem}>
                <svg className={styles.shippingIcon} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd"/>
                </svg>
                <span className={styles.shippingText}>Chính sách đổi trả 30 ngày</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}