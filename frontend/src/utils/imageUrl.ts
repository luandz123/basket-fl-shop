/**
 * Converts a backend image path to a properly served URL
 * @param imagePath The image path from the backend (e.g., /upload/file-123.jpg)
 * @returns A properly formatted URL for the image
 */

export function getImageUrl(imagePath: string): string {
  // Default placeholder that's guaranteed to exist (data URL)
  const DEFAULT_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
  
  if (!imagePath) {
    return DEFAULT_PLACEHOLDER;
  }

  try {
    // Làm sạch đường dẫn
    const cleanPath = imagePath.replace(/["']/g, '');
    
    // Kiểm tra nếu đã là URL đầy đủ
    if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
      return cleanPath;
    }
    
    // Xử lý đường dẫn tương đối từ thư mục upload
    if (cleanPath.startsWith('/upload/')) {
      // Lấy tên file
      const filename = cleanPath.replace('/upload/', '');
      // Trả về đường dẫn tới API route
      return `/api/images/${filename}`;
    }
    
    return cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  } catch (error) {
    console.error('Error processing image path:', error);
    return DEFAULT_PLACEHOLDER;
  }
}
