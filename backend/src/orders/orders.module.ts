import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { CartModule } from '../cart/cart.module'; // Thêm import này

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    CartModule, // Thêm CartModule vào imports
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService], // Xuất OrdersService để có thể sử dụng ở nơi khác nếu cần
})
export class OrdersModule {}