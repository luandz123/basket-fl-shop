'use client';

import React, { useState, useEffect, Suspense } from 'react';
import useAuth from '@/hooks/useAuth';
import { getOrders } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

interface OrderItem {
  id: number;
  product: {
    id: number;
    name: string;
    image: string;
    price: number | string;
  } | null;
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

// Create a client component that uses useSearchParams
function OrdersContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Query params sau khi đơn hàng được tạo thành công
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
        const response = await getOrders({ page: 1, limit: 10 });
        console.log('Orders response:', response);
        if (response && response.orders) {
          setOrders(response.orders);
        } else if (response && Array.isArray(response)) {
          setOrders(response);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user, router]);

  const getStatusBadge = (status: string) => {
    const statusClasses: { [key: string]: string } = {
      pending: styles.badgePending,
      processing: styles.badgeProcessing,
      shipped: styles.badgeShipped,
      delivered: styles.badgeDelivered,
      cancelled: styles.badgeCancelled,
    };
    const badgeClass = status && status.toLowerCase() in statusClasses
      ? statusClasses[status.toLowerCase()]
      : '';
    return (
      <span className={`${styles.badge} ${badgeClass}`}>
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
    } catch {
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
      <div className={styles.loader}></div>
    );
  }

  return (
    <>
      {success && (
        <div className={styles.successAlert}>
          <p>Đơn hàng của bạn đã được đặt thành công!</p>
          {orderId && <p>Mã đơn hàng: {orderId}</p>}
          <p>Bạn có thể theo dõi trạng thái đơn hàng của mình ở đây.</p>
        </div>
      )}

      {orders && orders.length > 0 ? (
        <div className={styles.ordersList}>
          {orders.map(order => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.orderHeaderContent}>
                  <div>
                    <h3 className={styles.orderTitle}>Đơn hàng #{order.id}</h3>
                    <p className={styles.orderDate}>
                      Đặt vào lúc {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className={styles.orderStatus}>
                    <div>{getStatusBadge(order.status)}</div>
                    <div className={styles.orderTotal}>${formatPrice(order.total)}</div>
                  </div>
                </div>
              </div>
              <div className={styles.orderBody}>
                <div className={styles.section}>
                  <p className={styles.sectionTitle}>Địa chỉ giao hàng:</p>
                  <p className={styles.sectionText}>{order.address}</p>
                </div>
                <div className={styles.section}>
                  <p className={styles.sectionTitle}>Phương thức thanh toán:</p>
                  <p className={styles.sectionText}>
                    {order.paymentMethod === 'cashOnDelivery'
                      ? 'Thanh toán khi nhận hàng'
                      : order.paymentMethod === 'creditCard'
                      ? 'Thẻ tín dụng'
                      : order.paymentMethod === 'bankTransfer'
                      ? 'Chuyển khoản'
                      : order.paymentMethod}
                  </p>
                </div>
                <div className={styles.divider}>
                  <p className={styles.sectionTitle}>Sản phẩm:</p>
                  {order.items && order.items.length > 0 ? (
                    <ul className={styles.itemsList}>
                      {order.items.map(item => (
                        <li key={item.id} className={styles.item}>
                          <div className={styles.itemDetail}>
                            {item.product ? (
                              <Link href={`/products/${item.product.id}`} className={styles.itemName}>
                                {item.product.name}
                              </Link>
                            ) : (
                              <span className={styles.sectionText}>Không có sản phẩm</span>
                            )}
                            <p className={styles.itemSubText}>
                              Số lượng: {item.quantity} x ${formatPrice(item.price)}
                            </p>
                          </div>
                          <div className={styles.orderPrice}>
                            ${formatPrice(item.quantity * (item.price || 0))}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.sectionText}>Không có sản phẩm nào</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📦</div>
          <p className={styles.emptyText}>Bạn chưa đặt bất kỳ đơn hàng nào</p>
          <Link href="/products" className={styles.emptyButton}>
            Bắt đầu mua sắm
          </Link>
        </div>
      )}
    </>
  );
}

// Main page component with Suspense
export default function OrdersPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Đơn hàng của bạn</h1>
      <Suspense fallback={
        <div className={styles.loader}></div>
      }>
        <OrdersContent />
      </Suspense>
    </div>
  );
}