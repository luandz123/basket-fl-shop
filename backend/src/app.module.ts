import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Phát hiện môi trường Railway hoặc Vercel
        const isProduction = process.env.NODE_ENV === 'production';
        
        console.log('Môi trường:', isProduction ? 'Production (Railway)' : 'Local');
        
        // Thử kết nối đến database
        console.log('Đang kết nối đến database...');
        
        if (isProduction) {
          // Cấu hình cho Railway - sử dụng biến môi trường cung cấp
          console.log('Sử dụng Production Database');
          return {
            type: 'mysql',
            host: configService.get('MYSQLHOST'),
            port: +configService.get('MYSQLPORT'),
            username: configService.get('MYSQLUSER'),
            password: configService.get('MYSQLPASSWORD'),
            database: configService.get('MYSQLDATABASE'),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: false, // Không đồng bộ schema trong production
            ssl: {
              rejectUnauthorized: false, // Quan trọng cho Railway MySQL
            },
            connectTimeout: 60000,
            retryAttempts: 15,
            retryDelay: 5000,
            logging: ['error', 'warn'],
            keepConnectionAlive: true,
            autoLoadEntities: true,
            extra: {
              connectionLimit: 10,
              queueLimit: 0,
              enableKeepAlive: true,
              keepAliveInitialDelay: 10000
            }
          };
        } else {
          // Cấu hình local
          console.log('Sử dụng Local Database');
          console.log(`Host: ${configService.get('DB_HOST')}, Port: ${configService.get('DB_PORT')}`);
          return {
            type: 'mysql',
            host: configService.get('DB_HOST', '127.0.0.1'),
            port: +configService.get('DB_PORT', 3306),
            username: configService.get('DB_USERNAME', 'root'),
            password: configService.get('DB_PASSWORD', 'luandz123'),
            database: configService.get('DB_DATABASE', 'gio_hoa'),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
            connectTimeout: 30000,
            logging: true,
            retryAttempts: 10,
            retryDelay: 3000,
            autoLoadEntities: true,
          };
        }
      },
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'upload'),
      serveRoot: '/upload',
    }),
    UsersModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    CartModule,
    OrdersModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}