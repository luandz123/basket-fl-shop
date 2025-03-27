import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { OrderItem } from './order-item.entity.js';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.id, { eager: true })
  user: User;

  @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true, eager: true })
  items: OrderItem[];

  @Column('decimal')
  total: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column()
  address: string;

  @Column()
  paymentMethod: string;

  // THÊM CỘT paymentStatus để xác định trạng thái thanh toán
  @Column({ default: 'unpaid' })
  paymentStatus: string;  // Các giá trị có thể là 'unpaid' hoặc 'paid'

  @CreateDateColumn()
  createdAt: Date;
}