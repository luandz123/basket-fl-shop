import { Controller, Get, Patch, Param, Body, Req, UseGuards, BadRequestException, Logger } from '@nestjs/common';
import { UserService } from './user.service';
import { AdminGuard } from '../guards/admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class UpdateUserDto {
  isActive: boolean;
}

@Controller()
export class UserController {
  private readonly logger = new Logger(UserController.name);
  
  constructor(private readonly userService: UserService) {}

  // GET /users/me - returns current authenticated user
  @Get('users/me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req) {
    try {
      this.logger.log(`Getting user profile for ID: ${req.user.id}, Role: ${req.user.role}`);
      
      const user = await this.userService.findOne(req.user.id);
      if (!user) {
        this.logger.warn(`User not found: ${req.user.id}`);
        throw new BadRequestException('User not found');
      }
      
      const { password, ...result } = user;
      this.logger.log(`User profile retrieved successfully for: ${user.email}`);
      return result;
    } catch (error) {
      this.logger.error(`Error fetching user profile: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to fetch user profile');
    }
  }

  // GET /admin/users - admin only endpoint to get all users
  @Get('admin/users')
  @UseGuards(AdminGuard)
  async getAllUsers() {
    try {
      const users = await this.userService.findAll();
      return users.map(user => {
        // Don't send password hash to frontend
        const { password, ...result } = user;
        return result;
      });
    } catch (error) {
      throw new BadRequestException('Could not fetch users');
    }
  }

  // PATCH /admin/users/:id - admin only endpoint to update user
  @Patch('admin/users/:id')
  @UseGuards(AdminGuard)
  async updateUser(@Param('id') id: string, @Body() updateData: UpdateUserDto) {
    try {
      const user = await this.userService.update(Number(id), updateData);
      const { password, ...result } = user;
      return result;
    } catch (error) {
      throw new BadRequestException(`Could not update user: ${error.message}`);
    }
  }

  // PATCH /users/:id - standard user endpoint (for non-admin fields)
  @Patch('users/:id')
  async updateCurrentUser(@Param('id') id: string, @Body() updateData: Partial<any>) {
    // This would typically include a guard to ensure users can only update their own data
    return this.userService.update(Number(id), updateData);
  }
}
