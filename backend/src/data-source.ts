import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

// Xác định môi trường đang chạy
const isDocker = process.env.RUNNING_IN_DOCKER === 'true';

// Thông tin kết nối cho môi trường local (phát triển)
const localConfig = {
  host: 'localhost',
  port: 3307,
  username: 'root',
  password: 'luandz123',
  database: 'gio_hoa'
};

// Thông tin kết nối cho môi trường Docker
const dockerConfig = {
  host: 'mysql',
  port: 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'luandz123',
  database: process.env.DB_DATABASE || 'gio_hoa'
};

// Chọn cấu hình dựa trên môi trường
const config = isDocker ? dockerConfig : localConfig;

export default new DataSource({
  type: 'mysql',
  host: config.host,
  port: config.port,
  username: config.username,
  password: config.password,
  database: config.database,
  entities: [join(__dirname, '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '**', '*.{ts,js}')],
  migrationsTableName: 'migrations',
});