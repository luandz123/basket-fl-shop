import * as dotenv from 'dotenv';
dotenv.config();

// Polyfill cho crypto nếu cần
import * as crypto from 'crypto';
if (!(global as any).crypto) {
  (global as any).crypto = crypto;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Bật CORS để frontend có thể gọi API
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  });
  
  // Thiết lập prefix cho tất cả API
  app.setGlobalPrefix('api');
  
  // Bật global pipe để xác thực DTO
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  
  // Lấy port từ biến môi trường hoặc 3001
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`Application is running on port ${port}`);
}

// Bắt đầu ứng dụng khi không trong môi trường production
if (process.env.NODE_ENV !== 'production') {
  bootstrap();
}

export { AppModule, bootstrap };