'use client';

import React, { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import { getCart, updateCartItem, removeFromCart } from '@/lib/api';
import { useRouter } from 'next/navigation';
import SafeImage from '@/components/SafeImage';
import Link from 'next/link';

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

  // Hàm để định dạng giá
  const formatPrice = (price: number | string): string => {
    if (typeof price === 'string') {
      const numPrice = parseFloat(price);
      return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
    }
    return price.toFixed(2);
  };

  // Hàm để tính tổng giá
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
        
        // Check if cartData is in expected format
        if (cartData && Array.isArray(cartData)) {
          setCartItems(cartData);
        } else {
          console.log('Received unexpected cart data format:', cartData);
          setCartItems([]);
          setError('The cart service is currently unavailable. Please try again later.');
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
        setCartItems([]);
        setError('Unable to load your cart. The cart service may be unavailable.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, [user, router]);

  useEffect(() => {
    const calculateTotal = () => {
      let newTotal = 0;
      cartItems.forEach(item => {
        newTotal += calculateItemTotal(item.product.price, item.quantity);
      });
      setTotal(newTotal);
    };

    calculateTotal();
  }, [cartItems]);

  const handleQuantityChange = async (itemId: number, productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdating(productId);
      await updateCartItem(productId, newQuantity);
      // Update local state
      setCartItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      setError('Failed to update quantity. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (productId: number) => {
    try {
      setRemovingItem(productId);
      await removeFromCart(productId);
      // Update local state
      setCartItems(prev => prev.filter(item => item.product.id !== productId));
    } catch (error) {
      console.error('Error removing item from cart:', error);
      setError('Failed to remove item. Please try again.');
    } finally {
      setRemovingItem(null);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    router.push('/checkout');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Shopping Cart</h1>
        <Link 
          href="/products" 
          className="text-green-600 hover:text-green-800 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Continue Shopping
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {!error && cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <h2 className="font-semibold text-lg">Cart Items ({cartItems.length})</h2>
              </div>
              
              <ul className="divide-y divide-gray-200">
                {cartItems.map(item => (
                  <li key={item.id} className="px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      {/* Product image and name */}
                      <div className="flex items-center flex-grow mb-4 sm:mb-0">
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mr-4">
                          <SafeImage
                            src={item.product.image}
                            alt={item.product.name}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        <div className="flex flex-col flex-grow">
                          <Link 
                            href={`/products/${item.product.id}`}
                            className="font-medium text-gray-900 hover:text-green-600"
                          >
                            {item.product.name}
                          </Link>
                          <p className="mt-1 text-sm text-gray-500">Unit price: ${formatPrice(item.product.price)}</p>
                          <div className="mt-2 flex items-center sm:hidden">
                            <p className="text-green-600 font-medium">
                              ${formatPrice(calculateItemTotal(item.product.price, item.quantity))}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Quantity & price */}
                      <div className="flex items-center">
                        <div className="flex items-center border border-gray-300 rounded-md mr-4">
                          <button 
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                            onClick={() => handleQuantityChange(item.id, item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || updating === item.product.id}
                          >
                            −
                          </button>
                          <span className="px-3 py-1 text-center min-w-[40px]">
                            {updating === item.product.id ? (
                              <div className="w-4 h-4 border-t-2 border-green-500 border-r-2 rounded-full animate-spin mx-auto"></div>
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button 
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                            onClick={() => handleQuantityChange(item.id, item.product.id, item.quantity + 1)}
                            disabled={updating === item.product.id}
                          >
                            +
                          </button>
                        </div>
                        
                        <div className="hidden sm:block text-right min-w-[80px] mr-4">
                          <p className="text-green-600 font-medium">
                            ${formatPrice(calculateItemTotal(item.product.price, item.quantity))}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveItem(item.product.id)}
                          className="text-gray-400 hover:text-red-500"
                          disabled={removingItem === item.product.id}
                        >
                          {removingItem === item.product.id ? (
                            <div className="w-5 h-5 border-t-2 border-red-500 border-r-2 rounded-full animate-spin"></div>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Cart summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-lg font-medium mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-4 flex justify-between">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-green-600">${formatPrice(total)}</span>
                </div>
              </div>
              
              <button
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
                className="w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Proceed to Checkout
              </button>
              
              <div className="mt-6">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-5a1 1 0 00-1-1H3z" />
                  </svg>
                  <span className="text-sm text-gray-600">Free delivery for orders over $50</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600">30-day easy returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="h-32 w-32 mx-auto mb-4">
            <svg className="w-full h-full text-gray-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-medium mb-4">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">
            {error 
              ? 'There was an error loading your cart. Please try again later.' 
              : 'Looks like you haven\'t added anything to your cart yet.'}
          </p>
          <Link
            href="/products"
            className="inline-block bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
}