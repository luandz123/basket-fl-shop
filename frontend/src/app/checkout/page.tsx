//// filepath: c:\giohoacuoicung\frontend\src\app\checkout\page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { getCart, createOrder, initiatePayment } from '@/lib/api';
import Link from 'next/link';
import SafeImage from '@/components/SafeImage';
import './checkout.css';

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

const CheckoutPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cashOnDelivery');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');

  const formatPrice = (price: number | string): string => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return num.toFixed(2);
  };

  const calculateItemTotal = (price: number | string, quantity: number): number => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return num * quantity;
  };

  useEffect(() => {
    if (!user) {
      router.push('/login?returnUrl=/checkout');
      return;
    }

    async function fetchCart() {
      try {
        setLoading(true);
        const items = await getCart();
        if (items && Array.isArray(items)) {
          setCartItems(items);
          const cartTotal = items.reduce(
            (sum, item) => sum + calculateItemTotal(item.product.price, item.quantity),
            0
          );
          setTotal(cartTotal);
        } else {
          setCartItems([]);
          setTotal(0);
        }
      } catch (err) {
        console.error('Error fetching cart:', err);
        setError('Failed to load your cart items. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchCart();
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }
    if (!address.trim()) {
      setError('Please enter your delivery address');
      return;
    }
    if (paymentMethod !== 'cashOnDelivery') {
      if (!customerName.trim() || !phone.trim()) {
        setError('Please enter your name and phone number for payment');
        return;
      }
    }

    try {
      setSubmitting(true);
      setError('');

      const orderData = {
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: typeof item.product.price === 'string'
            ? parseFloat(item.product.price)
            : item.product.price,
        })),
        address,
        paymentMethod,
        customerName: customerName || '',
        phone: phone || '',
      };

      console.log('Submitting order:', orderData);
      const orderResponse = await createOrder(orderData);
      console.log('Order created:', orderResponse);

      // Nếu thanh toán là COD, chuyển thẳng đến trang đơn hàng
      if (paymentMethod === 'cashOnDelivery') {
        router.push(`/orders?success=true&orderId=${orderResponse.id}`);
        return;
      }

      // Nếu là thanh toán online, khởi tạo phiên thanh toán
      const paymentSession = await initiatePayment({
        orderId: orderResponse.id,
        customerName,
        phone,
      });
      
      if (paymentSession.success) {
        // Trong môi trường thực tế, chuyển đến URL thanh toán
        // window.location.href = paymentSession.paymentUrl;
        
        // Trong môi trường giả lập, chuyển đến trang giả lập thanh toán
        router.push(`/payment-simulation?orderId=${orderResponse.id}&amount=${total}`);
      } else {
        setError(paymentSession.message || 'Could not initiate payment');
      }
    } catch (err) {
      console.error('Error processing checkout:', err);
      setError('Failed to process your order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-container">
        <h1 className="checkout-title">Thanh Toán</h1>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !loading) {
    return (
      <div className="checkout-container">
        <h1 className="checkout-title">Thanh Toán</h1>
        <div className="empty-cart">
          <p className="empty-message">Giỏ hàng của bạn đang trống</p>
          <Link href="/products" className="primary-button">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1 className="checkout-title">Thanh Toán</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="checkout-grid">
        {/* Order Summary */}
        <div>
          <div className="order-summary">
            <h2 className="summary-title">Tổng quan đơn hàng</h2>
            {cartItems.map((item) => (
              <div key={item.id} className="item-row">
                <div className="item-image">
                  <SafeImage
                    src={item.product.image}
                    alt={item.product.name}
                    width={100}
                    height={100}
                  />
                </div>
                <div className="item-details">
                  <h3 className="item-name">{item.product.name}</h3>
                  <p className="item-price">
                    {item.quantity} x ${formatPrice(item.product.price)}
                  </p>
                </div>
                <div className="item-total">
                  <p className="item-total-price">
                    ${formatPrice(calculateItemTotal(item.product.price, item.quantity))}
                  </p>
                </div>
              </div>
            ))}
            <div className="summary-footer">
              <div className="summary-row">
                <span>Tổng phụ:</span>
                <span>${formatPrice(total)}</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển:</span>
                <span>Miễn phí</span>
              </div>
              <div className="total-row">
                <span>Tổng cộng:</span>
                <span>${formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Checkout Form */}
        <div>
          <div className="checkout-form">
            <h2 className="form-title">Vận chuyển & Thanh toán</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="address" className="form-label">
                  Địa chỉ giao hàng
                </label>
                <textarea
                  id="address"
                  className="form-textarea"
                  rows={4}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="customerName" className="form-label">
                  Tên khách hàng
                </label>
                <input
                  type="text"
                  id="customerName"
                  className="form-input"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required={paymentMethod !== 'cashOnDelivery'}
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  id="phone"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required={paymentMethod !== 'cashOnDelivery'}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phương thức thanh toán</label>
                <div className="payment-options">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cashOnDelivery"
                      checked={paymentMethod === 'cashOnDelivery'}
                      onChange={() => setPaymentMethod('cashOnDelivery')}
                      className="radio-input"
                    />
                    Thanh toán khi nhận hàng
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="creditCard"
                      checked={paymentMethod === 'creditCard'}
                      onChange={() => setPaymentMethod('creditCard')}
                      className="radio-input"
                    />
                    Thanh toán bằng thẻ tín dụng
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bankTransfer"
                      checked={paymentMethod === 'bankTransfer'}
                      onChange={() => setPaymentMethod('bankTransfer')}
                      className="radio-input"
                    />
                    Chuyển khoản ngân hàng
                  </label>
                </div>
              </div>
              <div className="button-group">
                <button
                  type="submit"
                  disabled={submitting || cartItems.length === 0}
                  className="primary-button"
                >
                  {submitting ? 'Đang xử lý...' : paymentMethod === 'cashOnDelivery' ? 'Đặt hàng' : 'Tiến hành thanh toán'}
                </button>
                <Link
                  href="/cart"
                  className="secondary-button"
                >
                  Quay lại giỏ hàng
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;