'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/utils/imageUrl';

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

const SafeImage: React.FC<SafeImageProps> = ({ 
  src, 
  alt, 
  width, 
  height, 
  className = ''
}) => {
  const [error, setError] = useState(false);
  const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
  
  // Xử lý URL hình ảnh
  const imageUrl = error ? fallbackImage : getImageUrl(src);
  
  // Sử dụng <img> thông thường thay vì next/image khi không có width/height
  if (!width || !height) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        className={className}
        onError={() => setError(true)}
      />
    );
  }
  
  // Sử dụng next/image khi có width và height
  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setError(true)}
    />
  );
};

export default SafeImage;