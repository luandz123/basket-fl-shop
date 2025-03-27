//// filepath: c:\giohoacuoicung\backend\src\payment\payment.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { OrdersService } from '../orders/orders.service';

@Controller('payment')
export class PaymentController {
  constructor(
    private paymentService: PaymentService,
    private orderService: OrdersService,
  ) {}

  @Post('process')
  async processPayment(@Body() paymentRequest: { orderId: number; paymentData: any }) {
    // Lấy đơn hàng theo orderId
    const order = await this.orderService.findOne(paymentRequest.orderId);
    if (!order) {
      return { success: false, message: 'Đơn hàng không tồn tại' };
    }
    // Xử lý thanh toán
    return await this.paymentService.processPayment(order, paymentRequest.paymentData);
  }
}