'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { processPayment } from '@/lib/api';
import Link from 'next/link';
import styles from './page.module.css';

export default function PaymentSimulationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  useEffect(() => {
    if (paymentSuccess && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (paymentSuccess && countdown === 0) {
      router.push(`/orders?success=true&orderId=${orderId}`);
    }
  }, [paymentSuccess, countdown, router, orderId]);

  const handlePaymentSuccess = async () => {
    if (!orderId) return;
    
    try {
      setProcessing(true);
      // Gọi API để xác nhận thanh toán thành công
      const paymentResult = await processPayment({
        orderId: parseInt(orderId),
        paymentStatus: 'success'
      });
      
      if (paymentResult.success) {
        setPaymentSuccess(true);
      } else {
        setError('Payment confirmation failed. Please contact customer support.');
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      setError('An error occurred while processing your payment.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentCancel = () => {
    router.push(`/checkout?cancelled=true`);
  };

  if (!orderId || !amount) {
    return (
      <div className={styles.invalidContainer}>
        <h1 className={styles.invalidHeading}>Yêu cầu thanh toán không hợp lệ</h1>
        <p className={styles.invalidMessage}>
          Thiếu thông tin cần thiết để xử lý thanh toán.
        </p>
        <button onClick={() => router.push('/checkout')} className={styles.btn}>
          Quay lại thanh toán
        </button>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
          </div>
          <h1 className={styles.successHeading}>Thanh toán thành công!</h1>
          <p className={styles.successText}>
            Đơn hàng của bạn đã được xác nhận và đang được xử lý.
          </p>
          <p className={styles.redirectText}>
            Đang chuyển hướng đến đơn hàng của bạn trong {countdown} giây...
          </p>
          <Link href={`/orders?success=true&orderId=${orderId}`} className={styles.viewOrderBtn}>
            Xem đơn hàng của bạn
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.paymentCard}>
        {/* Payment progress steps */}
        <div className={styles.progressSteps}>
          <div className={styles.step}>
            <div className={styles.stepCircle}>1</div>
            <span className={styles.stepLabel}>Cart</span>
          </div>
          <div className={styles.step}>
            <div className={styles.stepCircle}>2</div>
            <span className={styles.stepLabel}>Checkout</span>
          </div>
          <div className={styles.step}>
            <div className={styles.stepCircle}>3</div>
            <span className={styles.stepLabel}>Payment</span>
          </div>
        </div>

        <h1 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
          Thanh toán an toàn
        </h1>

        <div className={styles.paymentDetails}>
          <div className={styles.detailRow}>
            <span className="fontMedium">Mã đơn hàng:</span>
            <span>{orderId}</span>
          </div>
          <div className={styles.detailRow}>
            <span className="fontMedium">Tổng số tiền:</span>
            <span className="fontBold">${amount}</span>
          </div>
          <div className={styles.detailRow}>
            <span className="fontMedium">Thương nhân:</span>
            <span>Cửa hàng hoa</span>
          </div>
        </div>
        
        {error && (
          <div className={styles.errorBox}>
            {error}
          </div>
        )}
        
        <div className={styles.paymentSection}>
          <h2 className={styles.paymentSectionHeading}>Chi tiết thanh toán</h2>
          
          <div className={styles.paymentForm}>
            <div className={styles.paymentFormRow}>
              <span>Số thẻ:</span>
              <span style={{ fontFamily: 'monospace' }}>•••• •••• •••• 4242</span>
            </div>
            <div className={styles.paymentFormRow}>
              <span>Tên chủ thẻ:</span>
              <input 
                type="text"
                placeholder="Tên của bạn"
                disabled={processing}
                className={styles.inputField}
              />
            </div>
            <div className={styles.paymentFormRow}>
              <span>Ngày hết hạn:</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select className={styles.selectField} disabled={processing}>
                  <option>01</option>
                  <option>02</option>
                  <option selected>12</option>
                </select>
                <select className={styles.selectField} disabled={processing}>
                  <option>2024</option>
                  <option selected>2025</option>
                  <option>2026</option>
                </select>
              </div>
            </div>
            <div className={styles.paymentFormRow}>
              <span>Mã bảo mật:</span>
              <input 
                type="text"
                placeholder="CVV"
                maxLength={3}
                disabled={processing}
                className={styles.inputField}
              />
            </div>
          </div>
          
          <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '1rem' }}>
            Đây là mô phỏng cổng thanh toán. Không thực hiện thanh toán thực tế.
          </p>
        </div>
        
        <div className={styles.buttonGroup}>
          <button 
            onClick={handlePaymentSuccess}
            disabled={processing}
            className={styles.confirmButton}
          >
            {processing ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg 
                  style={{ marginRight: '0.5rem', width: '1rem', height: '1rem' }} 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="animate-spin"
                >
                  <circle 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4" 
                    style={{ opacity: 0.25 }} 
                  />
                  <path 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" 
                    fill="currentColor" 
                    style={{ opacity: 0.75 }} 
                  />
                </svg>
                Đang xử lý...
              </span>
            ) : 'Xác nhận thanh toán'}
          </button>
          <button 
            onClick={handlePaymentCancel}
            disabled={processing}
            className={styles.cancelButton}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}