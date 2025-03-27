'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import useAuth from '@/hooks/useAuth';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [isMounted, setIsMounted] = useState(false);
  const auth = useAuth();

  // Chỉ tương tác với auth sau khi client-side hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Placeholder khi render ban đầu – giữ cấu trúc giống hoàn toàn
  if (!isMounted) {
    return (
      <div className={styles.navbar}>
        <div className={styles.container}>
          <div className={styles.brand}>Cửa hàng Hoa</div>
          <div className={styles.navLinks}>
            <span className={styles.link}>Sản phẩm</span>
            <span className={styles.link}>Đăng nhập</span>
            <span className={styles.link}>Đăng ký</span>
          </div>
        </div>
      </div>
    );
  }

  // Sau khi mount, có thể truy cập auth an toàn
  const { user, isAdmin, logout, loading } = auth;

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.brand}>
          Cửa hàng Hoa
        </Link>
        <div className={styles.navLinks}>
          <Link href="/products" className={styles.link}>
            Sản phẩm
          </Link>
          {loading ? (
            <span>Đang tải...</span>
          ) : user ? (
            <>
              <Link href="/cart" className={styles.link}>
                Giỏ hàng
              </Link>
              <Link href="/orders" className={styles.link}>
                Đơn hàng
              </Link>
              {isAdmin && (
                <div className={styles.adminLinks}>
                  <Link href="/admin/users" className={styles.adminButton}>
                    Người dùng
                  </Link>
                  <Link href="/admin/products" className={styles.adminButton}>
                    Sản phẩm
                  </Link>
                  <Link href="/admin/categories" className={styles.adminButton}>
                    Danh mục
                  </Link>
                  <Link href="/admin/orders" className={styles.adminButton}>
                    Đơn hàng
                  </Link>
                </div>
              )}
              <button onClick={logout} className={styles.logoutButton}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.link}>
                Đăng nhập
              </Link>
              <Link href="/register" className={styles.link}>
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;