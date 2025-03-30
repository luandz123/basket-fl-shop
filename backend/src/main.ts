import * as dotenv from 'dotenv';
dotenv.config();

import * as crypto from 'crypto';
if (!(global as any).crypto) {
  (global as any).crypto = crypto;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';

const server = express();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.use(helmet());
  app.use(compression());
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });
  app.setGlobalPrefix('api');
  await app.init();
}

bootstrap();

export default server;