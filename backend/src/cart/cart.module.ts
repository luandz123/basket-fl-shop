import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from './cart-item.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartItem]),
    ProductsModule, // Thêm để có thể sử dụng Product entity
  ],
  controllers: [CartController], // Thêm controller vào đây
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}