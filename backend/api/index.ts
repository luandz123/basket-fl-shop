import * as dotenv from 'dotenv';
dotenv.config();

import * as crypto from 'crypto';
if (!(global as any).crypto) {
  (global as any).crypto = crypto;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

const server = express();

async function bootstrap() {
  try {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
      {
        logger: ['error', 'warn', 'log', 'debug'], // Full logging for debugging
      }
    );
    
    app.enableCors({
      origin: process.env.FRONTEND_URL || '*',
      credentials: true,
    });
    
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.setGlobalPrefix('api');
    
    await app.init();
    console.log('NestJS application initialized for Vercel serverless');
    return app;
  } catch (error) {
    console.error('Bootstrap error:', error);
    throw error;
  }
}

let cachedApp: any;

export default async function handler(req: any, res: any) {
  try {
    if (!cachedApp) {
      console.log('Initializing NestJS app for Vercel serverless');
      cachedApp = await bootstrap();
    }
    
    const expressInstance = cachedApp.getHttpAdapter().getInstance();
    return expressInstance(req, res);
  } catch (error) {
    console.error('Vercel serverless handler error:', error);
    res.status(500).json({
      message: 'Internal Server Error',
      timestamp: new Date().toISOString(),
      path: req.url,
    });
  }
}