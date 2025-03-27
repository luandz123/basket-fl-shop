import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div>
            <h3 className={styles.heading}>Cửa hàng Hoa</h3>
            <p className={styles.textGray600}>
              Những bông hoa đẹp cho mọi dịp.
            </p>
          </div>
          
          <div>
            <h3 className={styles.heading}>Liên kết nhanh</h3>
            <ul className={styles.spaceY}>
              <li>
                <Link href="/" className={styles.link}>
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/products" className={styles.link}>
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link href="/contact" className={styles.link}>
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className={styles.heading}>Liên hệ với chúng tôi</h3>
            <address className={styles.address}>
              <p>Tư Sản -Phú Túc-Phú Xuyên </p>
              <p>Hà Nội , Việt Nam </p>
              <p className="mt-2">Email: lienhe@cuahanghoa.com</p>
              <p>Điện thoại: 09688290170968829017</p>
            </address>
          </div>
        </div>
        
        <div className={styles.bottom}>
          <p>
            &copy; {new Date().getFullYear()} Cửa hàng Hoa. Mọi quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;