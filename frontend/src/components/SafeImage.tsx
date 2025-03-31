'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string; // Add this line to accept the className prop
}

const SafeImage: React.FC<SafeImageProps> = ({ 
  src, 
  alt, 
  width = 400, 
  height = 400,
  className = '', // Default to empty string
}) => {
  const [error, setError] = useState(false);
  
  const fallbackSrc = '/placeholder.png'; // Your fallback image path

  return (
    <Image
      src={error ? fallbackSrc : src}
      alt={alt}
      width={width}
      height={height}
      className={className} // Use the className prop
      onError={() => setError(true)}
    />
  );
};

export default SafeImage;