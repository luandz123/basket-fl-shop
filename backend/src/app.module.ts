import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';

// ...các import khác

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Phát hiện môi trường Railway hoặc Vercel
        const isProduction = process.env.VERCEL || 
                           process.env.RAILWAY_STATIC_URL || 
                           process.env.RAILWAY_ENVIRONMENT;
        
        console.log('Môi trường:', isProduction ? 'Production (Vercel/Railway)' : 'Local');
        
        if (isProduction) {
          // Cấu hình cho Railway/Vercel - sử dụng biến môi trường cung cấp
          console.log('Sử dụng Production Database');
          return {
            type: 'mysql',
            host: configService.get('MYSQLHOST', 'localhost'),
            port: +configService.get('MYSQLPORT', 3306),
            username: configService.get('MYSQLUSER', 'root'),
            password: configService.get('MYSQLPASSWORD', ''),
            database: configService.get('MYSQLDATABASE', 'railway'),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: false, // Không đồng bộ schema trong production
            ssl: configService.get('MYSQL_SSL') === 'true' ? {
              rejectUnauthorized: false,
            } : undefined,
            connectTimeout: 60000,
            retryAttempts: 10,
            retryDelay: 3000,
            logging: ['error', 'warn'],
            extra: {
              connectionLimit: 5 // Giới hạn kết nối cho serverless
            }
          };
        } else {
          // Cấu hình local
          console.log('Sử dụng Local Database');
          return {
            type: 'mysql',
            host: configService.get('DB_HOST', '127.0.0.1'),
            port: +configService.get('DB_PORT', 3307),
            username: configService.get('DB_USERNAME', 'root'),
            password: configService.get('DB_PASSWORD', 'luandz123'),
            database: configService.get('DB_DATABASE', 'gio_hoa'),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
            connectTimeout: 30000,
            logging: true,
          };
        }
      },
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'upload'),
      serveRoot: '/upload',
    }),
    // ...các module khác
  ],
  // ...phần còn lại của module
})
export class AppModule {}