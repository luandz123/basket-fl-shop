import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';

import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { CartModule } from './cart/cart.module';
import { PaymentController } from './payment/payment.controller';
import { PaymentService } from './payment/payment.service';
import { PaymentModule } from './payment/payment.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Kiểm tra xem ứng dụng có đang chạy trên Render/production không
        const isProduction = configService.get('IS_PRODUCTION') === 'true' || 
                           process.env.RENDER === 'true';
        
        // In ra thông tin để debug
        console.log('Môi trường:', isProduction ? 'Production' : 'Development');
        
        if (isProduction) {
          // Sử dụng Railway Database trong môi trường sản xuất
          console.log('Sử dụng Railway Database');
          return {
            type: 'mysql',
            host: configService.get('RAILWAY_DB_HOST'),
            port: +configService.get('RAILWAY_DB_PORT', 3306),
            username: configService.get('RAILWAY_DB_USERNAME'),
            password: configService.get('RAILWAY_DB_PASSWORD'),
            database: configService.get('RAILWAY_DB_NAME'),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: false, // Không tự động đồng bộ schema trong production
            ssl: configService.get('RAILWAY_DB_SSL') === 'true' ? {
              rejectUnauthorized: false,
            } : undefined,
            connectTimeout: 60000,
            retryAttempts: 10,
            retryDelay: 3000,
            logging: ['error', 'warn'],
          };
        } else {
          // Sử dụng Local Database trong môi trường phát triển
          console.log('Sử dụng Local Database');
          return {
            type: 'mysql',
            host: configService.get('DB_HOST', '127.0.0.1'),
            port: +configService.get('DB_PORT', 3307),
            username: configService.get('DB_USERNAME', 'root'),
            password: configService.get('DB_PASSWORD', 'luandz123'),
            database: configService.get('DB_DATABASE', 'gio_hoa'),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true, // Có thể bật trong development
            connectTimeout: 30000,
            logging: true,
          };
        }
      },
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'upload'),
      serveRoot: '/upload',
    }),
    HttpModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    AuthModule,
    CartModule,
    PaymentModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    PaymentService,
  ],
  controllers: [PaymentController],
})
export class AppModule {}