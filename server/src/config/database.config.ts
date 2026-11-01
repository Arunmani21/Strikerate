import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Arunme211',
    database: process.env.DB_NAME || 'strikerate_db',
    entities: [join(__dirname, '..', 'modules', '**', '*.entity{.ts,.js}')],
    synchronize: true, // Set to false in production
    autoLoadEntities: true,
    logging: false, // Set to true for development debugging
  }),
);
