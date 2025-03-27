'use client';

import React, { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import { getCart, updateCartItem, removeFromCart } from '@/lib/api';
import { useRouter } from 'next/navigation';
import SafeImage from '@/components/SafeImage';
import Link from 'next/link';
import './cart.css';

interface CartItem {
  id: number;
  product: {
    id: number;
    name: string;
    price: number | string;
    image: string;
  };
  quantity: number;
}

export default function CartPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [removingItem, setRemovingItem] = useState<number | null>(null);

  const formatPrice = (price: number | string): string => {
    if (typeof price === 'string') {
      const numPrice = parseFloat(price);
      return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
    }
    return price.toFixed(2);
  };

  const calculateItemTotal = (price: number | string, quantity: number): number => {
    if (typeof price === 'string') {
      return parseFloat(price) * quantity;
    }
    return price * quantity;
  };

  useEffect(() => {
    if (!user) {
      router.push('/login?returnUrl=/cart');
      return;
    }
    const fetchCart = async () => {
      try {
        setIsLoading(true);
        const cartData = await getCart();
        if (cartData && Array.isArray(cartData)) {
          setCartItems(cartData);
        } else {
          setCartItems([]);
          setError('Dịch vụ giỏ hàng hiện không khả dụng. Vui lòng thử lại sau.');
        }
      } catch (error) {
        setCartItems([]);
        setError('Không thể tải giỏ hàng của bạn. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCart();
  }, [user, router]);

  useEffect(() => {
    let newTotal = 0;
    cartItems.forEach(item => {
      newTotal += calculateItemTotal(item.product.price, item.quantity);
    });
    setTotal(newTotal);
  }, [cartItems]);

  const handleQuantityChange = async (itemId: number, productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      setUpdating(productId);
      await updateCartItem(productId, newQuantity);
      setCartItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      setError('Không thể cập nhật số lượng. Vui lòng thử lại.');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (productId: number) => {
    try {
      setRemovingItem(productId);
      await removeFromCart(productId);
      setCartItems(prev => prev.filter(item => item.product.id !== productId));
    } catch (error) {
      setError('Không thể xóa sản phẩm. Vui lòng thử lại.');
    } finally {
      setRemovingItem(null);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setError('Giỏ hàng của bạn đang trống.');
      return;
    }
    router.push('/checkout');
  };

  if (isLoading) {
    return (
      <div className="cart-container">
        <h1 className="cart-title">Giỏ Hàng</h1>
        <div className="loading-spinner"></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1 className="cart-title">Giỏ Hàng</h1>
        <Link href="/products" className="continue-shopping">
          Tiếp tục mua sắm
        </Link>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {cartItems.length > 0 ? (
        <>
          <div className="cart-items">
            <div className="cart-items-header">
              Sản phẩm trong giỏ ({cartItems.length})
            </div>
            <ul>
              {cartItems.map(item => (
                <li key={item.id} className="cart-item">
                  <div className="item-info">
                    <div className="item-image">
                      <SafeImage
                        src={item.product.image}
                        alt={item.product.name}
                      />
                    </div>
                    <div className="item-details">
                      <Link href={`/products/${item.product.id}`}>
                        <span className="item-name">{item.product.name}</span>
                      </Link>
                      <p className="item-unit-price">
                        Đơn giá: ${formatPrice(item.product.price)}
                      </p>
                      <div className="quantity-controls">
                        <button
                          className="quantity-button"
                          onClick={() => handleQuantityChange(item.id, item.product.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updating === item.product.id}
                        >
                          −
                        </button>
                        <span className="quantity-display">
                          {updating === item.product.id ? '...' : item.quantity}
                        </span>
                        <button
                          className="quantity-button"
                          onClick={() => handleQuantityChange(item.id, item.product.id, item.quantity + 1)}
                          disabled={updating === item.product.id}
                        >
                          +
                        </button>
                      </div>
                      <p className="item-total-price">
                        ${formatPrice(calculateItemTotal(item.product.price, item.quantity))}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.product.id)}
                      disabled={removingItem === item.product.id}
                      title="Xóa sản phẩm"
                    >
                      {removingItem === item.product.id ? '...' : 'Xóa'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="cart-summary">
            <div className="summary-title">Tóm tắt đơn hàng</div>
            <div className="summary-row">
              <span>Tổng phụ:</span>
              <span>${formatPrice(total)}</span>
            </div>
            <div className="summary-row">
              <span>Vận chuyển:</span>
              <span>Miễn phí</span>
            </div>
            <div className="summary-total">
              <span>Tổng cộng: ${formatPrice(total)}</span>
            </div>
            <button onClick={handleCheckout} className="primary-button">
              Tiến hành thanh toán
            </button>
          </div>
        </>
      ) : (
        <div>
          <p>Giỏ hàng trống</p>
          <Link href="/products" className="primary-button">
            Mua sắm ngay
          </Link>
        </div>
      )}
    </div>
  );
}