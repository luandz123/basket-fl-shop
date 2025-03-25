'use client';

import React, { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import { getOrders } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface OrderItem {
  id: number;
  product: {
    id: number;
    name: string;
    image: string;
    price: number | string;
  } | null; // Cho phép product là null
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  total: number | string;
  status: string;
  createdAt: string;
  address: string;
  paymentMethod: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Query params trả về sau khi đơn hàng được tạo thành công
  const success = searchParams.get('success');
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await getOrders({ page: 1, limit: 10 });
        console.log('Orders response:', response);
        if (response && response.orders) {
          setOrders(response.orders);
        } else if (response && Array.isArray(response)) {
          setOrders(response);
        } else {
          setOrders([]);
          setError('Unexpected orders data format.');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setOrders([]);
        setError('Failed to load orders. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user, router]);

  const getStatusBadge = (status: string) => {
    const statusClasses: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    const statusClass = statusClasses[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${statusClass}`}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatPrice = (price: number | string | undefined | null): string => {
    if (price === null || price === undefined) {
      return '0.00';
    }
    
    if (typeof price === 'string') {
      const numPrice = parseFloat(price);
      return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
    }
    
    return price.toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Orders</h1>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <p>Your order has been placed successfully!</p>
          {orderId && <p>Order ID: {orderId}</p>}
          <p>You can track your order status here.</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {orders && orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Order #{order.id}</h3>
                    <p className="text-sm text-gray-600">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="mb-1">{getStatusBadge(order.status)}</div>
                    <div className="font-bold">${formatPrice(order.total)}</div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4">
                <div className="mb-4">
                  <p className="font-medium">Delivery Address:</p>
                  <p className="text-gray-600">{order.address}</p>
                </div>
                <div className="mb-4">
                  <p className="font-medium">Payment Method:</p>
                  <p className="text-gray-600">
                    {order.paymentMethod === 'cashOnDelivery'
                      ? 'Cash on Delivery'
                      : order.paymentMethod === 'creditCard'
                      ? 'Credit Card'
                      : order.paymentMethod === 'bankTransfer'
                      ? 'Bank Transfer'
                      : order.paymentMethod}
                  </p>
                </div>
                <div className="border-t pt-4">
                  <p className="font-medium mb-2">Items:</p>
                  {order.items && order.items.length > 0 ? (
                    <ul className="divide-y">
                      {order.items.map(item => (
                        <li key={item.id} className="py-2">
                          <div className="flex justify-between">
                            <div>
                              {item.product ? (
                                <Link href={`/products/${item.product.id}`} className="hover:underline">
                                  {item.product.name}
                                </Link>
                              ) : (
                                <span className="text-gray-500">Product unavailable</span>
                              )}
                              <p className="text-sm text-gray-600">
                                Quantity: {item.quantity} x ${formatPrice(item.price)}
                              </p>
                            </div>
                            <div className="font-medium">
                              ${formatPrice(item.quantity * (item.price || 0))}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600">No items available</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden p-6 text-center">
          <div className="text-5xl text-gray-300 mb-4">📦</div>
          <p className="text-xl mb-6">You haven't placed any orders yet</p>
          <Link
            href="/products"
            className="inline-block bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
}