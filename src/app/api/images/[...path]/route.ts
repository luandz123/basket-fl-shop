import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Kết hợp các phần của path
    const imagePath = params.path.join('/');
    
    // Xác định đường dẫn tới thư mục upload của backend
    const uploadDir = path.join(process.cwd(), '..', 'backend', 'upload');
    const filePath = path.join(uploadDir, imagePath);
    
    // Kiểm tra xem file có tồn tại không
    if (!fs.existsSync(filePath)) {
      console.error(`Image not found: ${filePath}`);
      return new Response('Image not found', { status: 404 });
    }
    
    // Đọc file hình ảnh
    const imageBuffer = fs.readFileSync(filePath);
    
    // Xác định kiểu MIME từ phần mở rộng của file
    const ext = path.extname(imagePath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';
    
    // Trả về hình ảnh với header phù hợp
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache trong 1 ngày
      },
    });
  } catch (error) {
    console.error(`Error serving image:`, error);
    return new Response('Error serving image', { status: 500 });
  }
}