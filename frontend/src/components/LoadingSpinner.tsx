import React from 'react';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  // Sử dụng mã màu tương đương với Tailwind blue-500: #3b82f6
  color = '#3b82f6',
  text = 'Loading...'
}) => {
  return (
    <div className={styles.container}>
      <div
        className={`${styles.spinner} ${styles[size]}`}
        style={{ borderTopColor: color, borderBottomColor: color }}
      ></div>
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;