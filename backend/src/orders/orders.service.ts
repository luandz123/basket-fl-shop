import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { OrderItem } from './order-item.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
  ) {}

    async createOrder(orderData: any): Promise<Order> {
    console.log('Creating order with data:', orderData);
    
    
    // Create order item objects
    const orderItems = orderData.items.map(item => 
      this.orderItemsRepository.create({
        product: { id: item.productId }, // assign the relation here
        quantity: item.quantity,
        price: item.price
      })
    );
    
    // Create order
    const order = this.ordersRepository.create({
      user: { id: orderData.userId },
      address: orderData.address,
      paymentMethod: orderData.paymentMethod,
      status: OrderStatus.PENDING,
      total: this.calculateTotal(orderData.items),
      items: orderItems
    });
    
    console.log('Created order object:', {
      userId: orderData.userId,
      address: orderData.address,
      paymentMethod: orderData.paymentMethod,
      itemsCount: orderItems.length,
      total: this.calculateTotal(orderData.items)
    });
    
    const savedOrder = await this.ordersRepository.save(order);
    console.log('Order saved successfully with ID:', savedOrder.id);
    
    return savedOrder;
  }
 

    async findAll(
    page: number,
    limit: number,
    filters?: {
      status?: string;
      search?: string;
      dateFrom?: string;
      dateTo?: string;
      paymentStatus?: string;
    }
  ): Promise<{ orders: Order[]; total: number }> {
    console.log(`Finding all orders with page=${page}, limit=${limit}, filters=`, filters);
    
    const query = this.ordersRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .orderBy('order.createdAt', 'DESC');
  
    if (filters) {
      if (filters.status) {
        query.andWhere('order.status = :status', { status: filters.status });
      }
      if (filters.paymentStatus) {
        query.andWhere('order.paymentStatus = :paymentStatus', { paymentStatus: filters.paymentStatus });
      }
      if (filters.dateFrom) {
        query.andWhere('order.createdAt >= :dateFrom', { dateFrom: filters.dateFrom });
      }
      if (filters.dateTo) {
        query.andWhere('order.createdAt <= :dateTo', { dateTo: filters.dateTo });
      }
      if (filters.search) {
        const search = filters.search;
        if (!isNaN(Number(search))) {
          query.andWhere('order.id = :orderId', { orderId: Number(search) });
        } else {
          query.andWhere('user.name ILIKE :search OR user.email ILIKE :search', { search: `%${search}%` });
        }
      }
    }
  
    query.skip((page - 1) * limit).take(limit);
  
    const [orders, total] = await query.getManyAndCount();
    return { orders, total };
  }

  async findUserOrders(userId: number, page: number, limit: number): Promise<{ orders: Order[]; total: number }> {
    console.log(`Finding orders for user ${userId} with page=${page}, limit=${limit}`);
    const skip = (page - 1) * limit;
    
    const [orders, total] = await this.ordersRepository.findAndCount({ 
      where: { user: { id: userId } },
      skip, 
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['items', 'items.product']
    });
    
    console.log(`Found ${orders.length} orders out of ${total} total for user ${userId}`);
    return { orders, total };
  }

  async findOne(id: number): Promise<Order> {
    console.log(`Finding order with ID ${id}`);
    const order = await this.ordersRepository.findOne({ 
      where: { id },
      relations: ['user', 'items', 'items.product'] 
    });
    
    if (!order) {
      console.log(`Order with ID ${id} not found`);
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    
    return order;
  }

  async updateStatus(id: number, status: OrderStatus): Promise<Order> {
    console.log(`Updating order ${id} status to ${status}`);
    const order = await this.findOne(id);
    order.status = status;
    
    const updatedOrder = await this.ordersRepository.save(order);
    console.log(`Order ${id} status updated successfully to ${status}`);
    
    return updatedOrder;
  }

  private calculateTotal(items: any[]): number {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    console.log(`Calculated total: ${total}`);
    return total;
  }
    async updatePaymentStatus(id: number, paymentStatus: string): Promise<Order> {
    console.log(`Updating order ${id} paymentStatus to ${paymentStatus}`);
    const order = await this.findOne(id);
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    order.paymentStatus = paymentStatus;
    const updatedOrder = await this.ordersRepository.save(order);
    console.log(`Order ${id} paymentStatus updated successfully to ${paymentStatus}`);
    return updatedOrder;
  }
}