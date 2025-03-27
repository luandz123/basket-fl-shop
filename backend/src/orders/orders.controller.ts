import { Controller, Post, Get, Patch, Param, Body, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderStatus } from './order.entity';
import { AdminGuard } from '../guards/admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/user.decorator';

class CreateOrderDto {
  items: Array<{
    productId: number;
    quantity: number;
    price: number;
  }>;
  address: string;
  paymentMethod: string;
}

class UpdateOrderStatusDto {
  status?: OrderStatus;
  paymentStatus?: string;
}

interface UserPayload {
  id: number;
  email: string;
  role: string;
}

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {
    console.log('OrdersController initialized');
  }

  @Post('orders')
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @Body() orderData: CreateOrderDto,
    @CurrentUser() user: UserPayload
  ) {
    console.log('Create order request:', orderData, 'User:', user.id);
    try {
      if (!orderData.address || !orderData.paymentMethod || !orderData.items || orderData.items.length === 0) {
        throw new BadRequestException('Invalid order data');
      }
      
      return this.ordersService.createOrder({
        ...orderData,
        userId: user.id
      });
    } catch (error) {
      console.error('Error creating order:', error);
      throw new BadRequestException(`Could not create order: ${error.message}`);
    }
  }

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  async getOrders(
    @CurrentUser() user: UserPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    console.log('Get orders request for user:', user.id);
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    return this.ordersService.findUserOrders(user.id, pageNum, limitNum);
  }
  
  @Get('orders/:id')
  @UseGuards(JwtAuthGuard)
  async getOrder(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload
  ) {
    console.log(`Get order details request for order ${id}, user: ${user.id}`);
    const order = await this.ordersService.findOne(+id);
    
    if (order.user.id !== user.id && user.role !== 'admin') {
      throw new BadRequestException('You do not have permission to view this order');
    }
    return order;
  }

    @Get('admin/orders')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getAllOrders(
    @CurrentUser() user: UserPayload,
    @Query('page') page?: string, 
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('paymentStatus') paymentStatus?: string,
  ) {
    console.log('Get all orders request (admin) from user:', user.id);
    try {
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 10;
      const filters = {
        status,
        search,
        dateFrom,
        dateTo,
        paymentStatus,
      };
      return this.ordersService.findAll(pageNum, limitNum, filters);
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw new BadRequestException('Could not fetch orders');
    }
  }

    @Patch('admin/orders/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateOrderStatus(
    @Param('id') id: string, 
    @Body() updateData: UpdateOrderStatusDto,
    @CurrentUser() user: UserPayload
  ) {
    console.log(`Update order request for order ${id} with data:`, updateData, "by admin:", user.id);
    try {
      if (updateData.status && !Object.values(OrderStatus).includes(updateData.status)) {
        throw new BadRequestException('Invalid order status');
      }
      
      // Xử lý cập nhật
      const orderId = Number(id);
      let updatedOrder: any;
      
      if (updateData.status) {
        updatedOrder = await this.ordersService.updateStatus(orderId, updateData.status);
      }
      
      if (updateData.paymentStatus) {
        updatedOrder = await this.ordersService.updatePaymentStatus(orderId, updateData.paymentStatus);
      }
      
      return updatedOrder;
    } catch (error) {
      console.error('Error updating order:', error);
      throw new BadRequestException(`Could not update order: ${error.message}`);
    }
  }
}