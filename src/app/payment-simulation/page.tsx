'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { processPayment } from '@/lib/api';
import Link from 'next/link';

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
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Invalid Payment Request</h1>
        <p className="mb-4">Missing required information to process payment.</p>
        <button 
          onClick={() => router.push('/checkout')}
          className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded"
        >
          Back to Checkout
        </button>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md text-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-green-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">Your order has been confirmed and is being processed.</p>
          <p className="text-gray-600 mb-6">Redirecting to your orders in {countdown} seconds...</p>
          <Link 
            href={`/orders?success=true&orderId=${orderId}`}
            className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded inline-block"
          >
            View Your Order
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Payment progress steps */}
        <div className="flex justify-between mb-8">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">1</div>
            <span className="text-xs mt-1">Cart</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">2</div>
            <span className="text-xs mt-1">Checkout</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">3</div>
            <span className="text-xs mt-1">Payment</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-6">Secure Payment</h1>
        <div className="border-b pb-4 mb-4">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Order ID:</span>
            <span>{orderId}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Total Amount:</span>
            <span className="font-bold">${amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Merchant:</span>
            <span>Flower Shop</span>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
          
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-4">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between">
                <span>Card Number:</span>
                <span className="font-mono">•••• •••• •••• 4242</span>
              </div>
              <div className="flex justify-between">
                <span>Cardholder Name:</span>
                <input 
                  type="text"
                  className="border border-gray-300 rounded px-2 py-1 w-32 text-right"
                  placeholder="Your name"
                  disabled={processing}
                />
              </div>
              <div className="flex justify-between">
                <span>Expiry Date:</span>
                <div className="flex gap-2">
                  <select className="border border-gray-300 rounded px-2 py-1 w-16" disabled={processing}>
                    <option>01</option>
                    <option>02</option>
                    <option selected>12</option>
                  </select>
                  <select className="border border-gray-300 rounded px-2 py-1 w-16" disabled={processing}>
                    <option>2024</option>
                    <option selected>2025</option>
                    <option>2026</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-between">
                <span>Security Code:</span>
                <input 
                  type="text"
                  className="border border-gray-300 rounded px-2 py-1 w-16 text-right"
                  placeholder="CVV"
                  maxLength={3}
                  disabled={processing}
                />
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mb-4">
            This is a simulation of a payment gateway. No actual payment will be processed.
          </p>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={handlePaymentSuccess}
            disabled={processing}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded disabled:bg-gray-400"
          >
            {processing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : 'Confirm Payment'}
          </button>
          <button
            onClick={handlePaymentCancel}
            disabled={processing}
            className="flex-1 border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded hover:bg-gray-50 disabled:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}