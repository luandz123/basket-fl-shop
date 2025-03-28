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
        // BẮT BUỘC sử dụng 127.0.0.1, bỏ qua giá trị từ biến môi trường
        // để đảm bảo luôn kết nối qua IPv4
        return {
          type: 'mysql',
          host: '127.0.0.1', // Hardcode trực tiếp thay vì đọc từ biến môi trường
          port: +configService.get('DB_PORT', 3306),
          username: configService.get('DB_USERNAME', 'root'),
          password: configService.get('DB_PASSWORD', ''),
          database: configService.get('DB_DATABASE', 'flower_shop'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get('NODE_ENV') !== 'production',
          // Xóa thuộc tính socketPath vì nó gây lỗi
          // Thay vào đó sử dụng extra để cấu hình kết nối
          extra: {
            // Các thiết lập bổ sung để đảm bảo kết nối IPv4
          },
          // QUAN TRỌNG: Tăng thời gian timeout để cho phép kết nối lâu hơn khi deploy
          connectTimeout: 60000,
          // Bật thử lại khi kết nối thất bại
          retryAttempts: 10,
          retryDelay: 3000,
          // Ghi log kết nối
          logging: ['error', 'warn'],
        };
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