import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    
    // Log môi trường
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`DATABASE: ${process.env.MYSQLHOST || 'not set'}`);
    
    // CORS
    app.enableCors({
      origin: process.env.FRONTEND_URL || '*',
      credentials: true,
    });
    
    // Middleware
    app.use(compression())
    app.use(helmet());
    
    // API prefix
    app.setGlobalPrefix('api');
    
    // Validation
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    
    // Port
    const port = process.env.PORT || 3001;
    await app.listen(port);
    
    console.log(`Application is running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  } catch (error) {
    console.error('Application failed to start:', error);
    process.exit(1);
  }
}

bootstrap();