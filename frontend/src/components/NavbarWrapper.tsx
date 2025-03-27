'use client';

import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import styles from './NavbarWrapper.module.css';

// Placeholder tĩnh sử dụng CSS thuần
const NavbarPlaceholder = () => (
  <div className={styles.placeholder}>
    <div className={styles.wrapper}>
      <div className={styles.brand}>Cửa hàng Hoa</div>
      <div className={styles.links}>
        <span>Sản phẩm</span>
        <span>Đăng nhập</span>
        <span>Đăng ký</span>
      </div>
    </div>
  </div>
);

export default function NavbarWrapper() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return <NavbarPlaceholder />;
  }
  
  return <Navbar />;
}