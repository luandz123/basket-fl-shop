import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItem } from './cart-item.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartRepository: Repository<CartItem>,
  ) {}

  async addToCart(userId: number, productId: number, quantity: number): Promise<CartItem> {
    console.log(`Adding to cart: user=${userId}, product=${productId}, quantity=${quantity}`);
    
    // Try to find an existing cart item for the user and product
    let item = await this.cartRepository.findOne({ 
      where: { 
        userId, 
        productId 
      } 
    });
    
    if (item) {
      // Nếu sản phẩm đã có trong giỏ hàng, tăng số lượng
      item.quantity += quantity;
      console.log(`Existing cart item found, updating quantity to ${item.quantity}`);
    } else {
      // Nếu sản phẩm chưa có trong giỏ hàng, tạo mới
      console.log('Creating new cart item');
      item = this.cartRepository.create({
        userId,
        productId,
        quantity,
      });
    }
    
    const result = await this.cartRepository.save(item);
    console.log('Cart item saved successfully');
    return result;
  }

  async getCart(userId: number): Promise<CartItem[]> {
    console.log(`Getting cart for user ${userId}`);
    return this.cartRepository.find({ 
      where: { userId },
      relations: ['product'] // Đảm bảo lấy thông tin sản phẩm
    });
  }

  async updateCartItem(userId: number, productId: number, quantity: number): Promise<CartItem | null> {
    console.log(`Updating cart item: user=${userId}, product=${productId}, quantity=${quantity}`);
    
    // Tìm cart item cần cập nhật
    const item = await this.cartRepository.findOne({ 
      where: { 
        userId, 
        productId 
      } 
    });
    
    // Nếu không tìm thấy cart item, throw lỗi
    if (!item) {
      console.log(`Cart item not found for product ${productId}`);
      throw new NotFoundException(`Cart item with product ID ${productId} not found`);
    }
    
    // Nếu quantity <= 0, xóa khỏi giỏ hàng
    if (quantity <= 0) {
      console.log(`Quantity is ${quantity}, removing item from cart`);
      await this.cartRepository.remove(item);
      return null;
    }
    
    // Cập nhật số lượng
    console.log(`Updating quantity from ${item.quantity} to ${quantity}`);
    item.quantity = quantity;
    
    // Lưu và trả về cart item đã cập nhật
    const result = await this.cartRepository.save(item);
    console.log('Cart item updated successfully');
    return result;
  }

  async removeFromCart(userId: number, productId: number): Promise<void> {
    console.log(`Removing from cart: user=${userId}, product=${productId}`);
    const result = await this.cartRepository.delete({ userId, productId });
    
    // Nếu không có bản ghi nào bị xóa, throw lỗi
    if (result.affected === 0) {
      console.log(`Cart item not found for product ${productId}`);
      throw new NotFoundException(`Cart item with product ID ${productId} not found`);
    }
    
    console.log('Cart item removed successfully');
  }
}