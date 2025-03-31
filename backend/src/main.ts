import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {
  try {
    console.log('Starting application...');
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    const app = await NestFactory.create(AppModule);
    
    // Add health check endpoint properly using HTTP adapter
    const httpAdapter = app.getHttpAdapter();
    httpAdapter.get('/health', (req, res) => {
      res.status(200).send('OK');
    });
    
    // CORS
    app.enableCors({
      origin: process.env.FRONTEND_URL || '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
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
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (error) {
    console.error('Application failed to start:', error);
    if (error.message?.includes('ECONNREFUSED')) {
      console.error('Database connection failed. Please check if:');
      console.error('1. MySQL server is running');
      console.error(`2. MySQL is accessible at ${process.env.DB_HOST}:${process.env.DB_PORT}`);
      console.error('3. Username and password are correct');
    }
    process.exit(1);
  }
}

bootstrap();