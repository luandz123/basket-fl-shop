import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Nếu request là cho file trong thư mục upload
  if (request.nextUrl.pathname.startsWith('/upload/')) {
    // Lấy phần path sau "/upload/"
    const filePath = request.nextUrl.pathname.substring('/upload/'.length);
    
    // Chuyển hướng đến API route để xử lý
    return NextResponse.rewrite(new URL(`/api/images/${filePath}`, request.url));
  }
  
  return NextResponse.next();
}

// Chỉ áp dụng middleware cho các đường dẫn upload
export const config = {
  matcher: '/upload/:path*',
};