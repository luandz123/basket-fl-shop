import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../products/product.entity';

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  productId: number; // Thêm cột productId

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'productId' }) // Liên kết với cột productId
  product: Product;

  @Column()
  quantity: number;
}