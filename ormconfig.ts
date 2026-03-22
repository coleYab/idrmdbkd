import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config();

const shouldUseSsl =
  Boolean(process.env.DATABASE_URL) ||
  Boolean(process.env.DB_HOST?.includes('neon.tech'));

const typeOrmConfig = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  host: process.env.DATABASE_URL ? undefined : process.env.DB_HOST,
  port:
    process.env.DATABASE_URL || !process.env.DB_PORT
      ? undefined
      : parseInt(process.env.DB_PORT, 10),
  database: process.env.DATABASE_URL ? undefined : process.env.DB_NAME,
  username: process.env.DATABASE_URL ? undefined : process.env.DB_USER,
  password: process.env.DATABASE_URL ? undefined : process.env.DB_PASS,
  ssl: shouldUseSsl
    ? {
        rejectUnauthorized: false,
      }
    : undefined,
  entities: [__dirname + '/src/**/entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  migrationsRun: true,
  synchronize: true,
});

export default typeOrmConfig;
