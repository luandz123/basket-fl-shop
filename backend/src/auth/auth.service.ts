import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(data: { email: string; password: string; name: string }) {
    // Check if user already exists
    try {
      const existingUser = await this.userService.findByEmail(data.email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      // If error is not a ConflictException, user does not exist, we can proceed
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create the user
    const user = await this.userService.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: UserRole.USER,
      isActive: true,
    });

    // Remove password from response
    const { password, ...result } = user;
    return result;
  }

  async login(data: { email: string; password: string }) {
    // Find the user
    const user = await this.userService.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated');
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT token payload
    const payload = { 
      sub: user.id,
      email: user.email,
      role: user.role
    };
    
    console.log('User login successful:', user.email, 'Role:', user.role);
    
    // Generate the token
    const token = this.jwtService.sign(payload);
    
    // Include more comprehensive user data in the response
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive
      },
    };
  }
}
