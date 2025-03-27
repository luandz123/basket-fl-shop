'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import useAuth from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { login as loginApi } from '@/lib/api';
import styles from './page.module.css';

interface FormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for error message in URL query params
  useEffect(() => {
    const errorMsg = searchParams ? searchParams.get('error') : null;
    if (errorMsg === 'session_expired') {
      setError('Phiên của bạn đã hết hạn. Vui lòng đăng nhập lại.');
    }
  }, [searchParams]);

  // Check if already logged in
  useEffect(() => {
    if (user && !loading) {
      console.log('Đã đăng nhập - Nhà cung cấp xác thực sẽ xử lý chuyển hướng');
      router.push('/'); // Redirect to home page if already logged in
    }
  }, [user, loading, router]);

  const onSubmit = async (data: FormData) => {
    setError(null);
    setIsSubmitting(true);
    try {
      console.log('Đang gửi biểu mẫu đăng nhập:', data.email);
      // First authenticate with the backend
      const response = await loginApi(data);
      
      // If successful, use the token to update auth context
      if (response && response.token) {
        login(response.token);
        router.push('/');
      } else {
        throw new Error('Phản hồi đăng nhập không chứa mã thông báo');
      }
    } catch (error: any) {
      console.error('Lỗi gửi đăng nhập:', error);
      setError(error.response?.data?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra thông tin đăng nhập của bạn.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  // Nếu đã đăng nhập, không hiển thị form
  if (user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1 className={styles.heading}>Đăng nhập</h1>
        
        {error && (
          <div className={styles.errorBox}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div>
            <label htmlFor="email" className={styles.label}>Email:</label>
            <input
              type="email"
              id="email"
              className={styles.input}
              {...register("email", { required: true })}
            />
            {errors.email && (
              <span className={styles.inputError}>Trường này là bắt buộc</span>
            )}
          </div>
          
          <div>
            <label htmlFor="password" className={styles.label}>Mật khẩu:</label>
            <input
              type="password"
              id="password"
              className={styles.input}
              {...register("password", { required: true })}
            />
            {errors.password && (
              <span className={styles.inputError}>Trường này là bắt buộc</span>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.button}
          >
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        
        <p className={styles.bottomText}>
          Bạn chưa có tài khoản?{' '}
          <Link href="/register" className={styles.link}>
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
}