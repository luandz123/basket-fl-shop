// QUAN TRỌNG: Luôn load dotenv và cấu hình crypto trước mọi import khác
import * as dotenv from 'dotenv';
dotenv.config();

// Cấu hình global crypto trước khi bất kỳ module nào được import
import * as crypto from 'crypto';
if (!(global as any).crypto) {
  (global as any).crypto = crypto;
}

// Chuyển sang require để đảm bảo thứ tự import chính xác
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./app.module');
const { ValidationPipe } = require('@nestjs/common');
const helmet = require('helmet');
const compression = require('compression');

async function bootstrap() {
  // Hiển thị thông tin cấu hình để debug
  console.log('Environment variables:');
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_PORT:', process.env.DB_PORT);
  console.log('DB_DATABASE:', process.env.DB_DATABASE);
  
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.use(helmet());
  app.use(compression());
  
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
}
bootstrap();