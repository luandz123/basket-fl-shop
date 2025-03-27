import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../users/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', 'your_jwt_secret'),
    });
  }

  async validate(payload: any) {
    this.logger.log(`Validating JWT for user: ${payload.email}, role: ${payload.role}`);
    
    try {
      const user = await this.userService.findOne(payload.sub);
      
      if (!user) {
        this.logger.warn(`User not found: ${payload.sub}`);
        throw new UnauthorizedException('User not found');
      }
      
      if (!user.isActive) {
        this.logger.warn(`User is not active: ${payload.email}`);
        throw new UnauthorizedException('User is not active');
      }
      
      this.logger.log(`Authentication successful for ${user.email}, role: ${user.role}`);
      
      // Return consistent user object with all necessary properties
      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        name: user.name,
        isActive: user.isActive
      };
    } catch (error) {
      this.logger.error(`JWT validation error: ${error.message}`);
      throw error;
    }
  }
}
