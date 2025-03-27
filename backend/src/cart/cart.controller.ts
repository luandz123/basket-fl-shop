import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { UserRole } from '../users/user.entity';

// Mở rộng interface Request
interface RequestWithUser extends Request {
  user: {
    id: number;
    email: string;
    role: UserRole;
  };
}

interface AddToCartDto {
  productId: number;
  quantity: number;
}

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async addToCart(@Req() req: RequestWithUser, @Body() dto: AddToCartDto) {
    console.log('Add to cart request:', dto);
    const userId = req.user.id;
    return this.cartService.addToCart(userId, dto.productId, dto.quantity);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getCart(@Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.cartService.getCart(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':productId')
  async updateCartItem(
    @Req() req: RequestWithUser,
    @Param('productId') productId: string,
    @Body() dto: { quantity: number }
  ) {
    const userId = req.user.id;
    return this.cartService.updateCartItem(userId, +productId, dto.quantity);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':productId')
  async removeFromCart(
    @Req() req: RequestWithUser,
    @Param('productId') productId: string
  ) {
    const userId = req.user.id;
    return this.cartService.removeFromCart(userId, +productId);
  }
}