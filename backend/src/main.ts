// THÊM: Load biến môi trường từ file .env trước khi thực hiện các import khác
import * as dotenv from 'dotenv';
dotenv.config();

// THÊM: Đảm bảo global crypto được thiết lập trước khi các module khác được import
import * as crypto from 'crypto';
if (!(global as any).crypto) {
  (global as any).crypto = crypto;
}

const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./app.module');
const { ValidationPipe } = require('@nestjs/common');
const helmet = require('helmet');
const compression = require('compression');

async function bootstrap() {
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
