//// filepath: c:\giohoacuoicung\frontend\src\app\checkout\page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { getCart, createOrder, initiatePayment } from '@/lib/api';
import Link from 'next/link';
import SafeImage from '@/components/SafeImage';

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
  const searchParams = useSearchParams();

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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-lg mb-4">Your cart is empty</p>
          <Link href="/products" className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center py-4 border-b last:border-0">
                <div className="w-16 h-16 mr-4">
                  <SafeImage
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.product.name}</h3>
                  <p className="text-gray-600">
                    {item.quantity} x ${formatPrice(item.product.price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ${formatPrice(calculateItemTotal(item.product.price, item.quantity))}
                  </p>
                </div>
              </div>
            ))}
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>${formatPrice(total)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Checkout Form */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold mb-4">Shipping & Payment</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="address" className="block text-gray-700 mb-2">
                  Delivery Address
                </label>
                <textarea
                  id="address"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows={4}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="customerName" className="block text-gray-700 mb-2">
                  Customer Name
                </label>
                <input
                  type="text"
                  id="customerName"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required={paymentMethod !== 'cashOnDelivery'}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="phone" className="block text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  id="phone"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required={paymentMethod !== 'cashOnDelivery'}
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Payment Method</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cashOnDelivery"
                      checked={paymentMethod === 'cashOnDelivery'}
                      onChange={() => setPaymentMethod('cashOnDelivery')}
                      className="mr-2"
                    />
                    Cash on Delivery
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="creditCard"
                      checked={paymentMethod === 'creditCard'}
                      onChange={() => setPaymentMethod('creditCard')}
                      className="mr-2"
                    />
                    Credit Card Payment
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bankTransfer"
                      checked={paymentMethod === 'bankTransfer'}
                      onChange={() => setPaymentMethod('bankTransfer')}
                      className="mr-2"
                    />
                    Bank Transfer
                  </label>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={submitting || cartItems.length === 0}
                  className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded disabled:bg-gray-400"
                >
                  {submitting ? 'Processing...' : paymentMethod === 'cashOnDelivery' ? 'Place Order' : 'Proceed to Payment'}
                </button>
                <Link
                  href="/cart"
                  className="text-center border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded hover:bg-gray-50"
                >
                  Back to Cart
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