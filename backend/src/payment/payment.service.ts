import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { Order } from '../orders/order.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PaymentService {
  constructor(
    private httpService: HttpService,
    private orderService: OrdersService,
  ) {}

  async processPayment(order: Order, paymentData: any): Promise<any> {
    try {
      // Thay vì gọi API thật, chúng ta giả lập kết quả thành công
      // Trong môi trường production, bạn sẽ sử dụng URL thật từ cổng thanh toán
      // const response = await firstValueFrom(this.httpService.post('URL_THẬT', {
      //   amount: order.total,
      //   paymentMethod: order.paymentMethod,
      //   ...paymentData,
      // }));
      
      // Giả lập phản hồi thành công từ payment gateway
      const simulatedSuccess = true; // hoặc tính toán dựa trên logic nghiệp vụ của bạn
      
      if (simulatedSuccess) {
        await this.orderService.updatePaymentStatus(order.id, 'paid');
        return { success: true, message: 'Thanh toán thành công' };
      } else {
        return { success: false, message: 'Thanh toán thất bại' };
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      throw new HttpException(
        'Có lỗi xảy ra trong quá trình thanh toán',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}