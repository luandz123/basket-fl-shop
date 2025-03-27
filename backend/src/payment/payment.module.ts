//// filepath: c:\giohoacuoicung\backend\src\payment\payment.module.ts
import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { OrdersModule } from '../orders/orders.module';
import { HttpModule } from '@nestjs/axios'; // Thêm HttpModule để sử dụng HttpService

@Module({
    imports: [HttpModule, OrdersModule],
    providers: [PaymentService],
    controllers: [PaymentController],
})
export class PaymentModule {}