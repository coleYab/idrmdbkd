import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createConnection, getConnectionManager } from 'typeorm';

import { ROLE } from '../src/auth/constants/role.constant';
import { LoginInput } from '../src/auth/dtos/auth-login-input.dto';
import { AuthTokenOutput } from '../src/auth/dtos/auth-token-output.dto';
import { RequestContext } from '../src/shared/request-context/request-context.dto';
import { CreateUserInput } from '../src/user/dtos/user-create-input.dto';
import { UserOutput } from '../src/user/dtos/user-output.dto';
import { UserService } from '../src/user/services/user.service';

const TEST_DB_HOST = process.env.TEST_DB_HOST || 'localhost';
const TEST_DB_CONNECTION_NAME = 'e2e_test_connection';
export const TEST_DB_NAME = 'e2e_test_db';

export const resetDBBeforeTest = async (): Promise<void> => {
  // This overwrites the DB_NAME used in the SharedModule's TypeORM init.
  // All the tests will run against the e2e db due to this overwrite.
  process.env.DB_NAME = TEST_DB_NAME;

  process.env.APP_ENV = process.env.APP_ENV || 'test';
  process.env.APP_PORT = process.env.APP_PORT || '3001';
  process.env.DB_HOST = process.env.DB_HOST || TEST_DB_HOST;
  process.env.DB_PORT = process.env.DB_PORT || '5432';
  process.env.DB_USER = process.env.DB_USER || 'root';
  process.env.DB_PASS = process.env.DB_PASS || 'example';

  const jwtPublic =
    process.env.JWT_PUBLIC_KEY_BASE64 ||
    Buffer.from('public').toString('base64');
  const jwtPrivate =
    process.env.JWT_PRIVATE_KEY_BASE64 ||
    Buffer.from('private').toString('base64');
  process.env.JWT_PUBLIC_KEY_BASE64 = jwtPublic;
  process.env.JWT_PRIVATE_KEY_BASE64 = jwtPrivate;
  process.env.JWT_ACCESS_TOKEN_EXP_IN_SEC =
    process.env.JWT_ACCESS_TOKEN_EXP_IN_SEC || '3600';
  process.env.JWT_REFRESH_TOKEN_EXP_IN_SEC =
    process.env.JWT_REFRESH_TOKEN_EXP_IN_SEC || '86400';
  process.env.DEFAULT_ADMIN_USER_PASSWORD =
    process.env.DEFAULT_ADMIN_USER_PASSWORD || 'default-admin-password';

  process.env.CHAPA_SECRET_KEY =
    process.env.CHAPA_SECRET_KEY || 'test-secret-key';
  process.env.CHAPA_WEBHOOK_SECRET =
    process.env.CHAPA_WEBHOOK_SECRET || 'test-webhook-secret';
  process.env.CHAPA_CALLBACK_URL =
    process.env.CHAPA_CALLBACK_URL || 'http://localhost/callback';
  process.env.CHAPA_RETURN_URL =
    process.env.CHAPA_RETURN_URL || 'http://localhost/return';

  console.log(`Dropping ${TEST_DB_NAME} database and recreating it`);
  const connection = await createConnection({
    name: TEST_DB_CONNECTION_NAME,
    type: 'postgres',
    host: TEST_DB_HOST,
    port: 5432,
    username: 'root',
    password: 'example',
    database: 'postgres',
  });

  await connection.query(`drop database if exists ${TEST_DB_NAME}`);
  await connection.query(`create database ${TEST_DB_NAME}`);

  await connection.close();
};

export const createDBEntities = async (): Promise<void> => {
  // Nest's TypeOrmModule (in SharedModule) will establish the application's
  // connection and run schema sync. We only create the database itself in
  // resetDBBeforeTest().
  console.log(`Skipping explicit entity sync for ${TEST_DB_NAME} database`);
};

export const seedAdminUser = async (
  app: INestApplication,
): Promise<{ adminUser: UserOutput; authTokenForAdmin: AuthTokenOutput }> => {
  const defaultAdmin: CreateUserInput = {
    name: 'Default Admin User',
    username: 'default-admin',
    password: 'default-admin-password',
    roles: [ROLE.ADMIN],
    isAccountDisabled: false,
    email: 'default-admin@example.com',
  };

  const ctx = new RequestContext();

  // Creating Admin User
  const userService = app.get(UserService);
  const userOutput = await userService.createUser(ctx, defaultAdmin);

  const loginInput: LoginInput = {
    username: defaultAdmin.username,
    password: defaultAdmin.password,
  };

  // Logging in Admin User to get AuthToken
  const loginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send(loginInput)
    .expect(HttpStatus.OK);

  const authTokenForAdmin: AuthTokenOutput = loginResponse.body.data;

  const adminUser: UserOutput = JSON.parse(JSON.stringify(userOutput));

  return { adminUser, authTokenForAdmin };
};

export const closeDBAfterTest = async (): Promise<void> => {
  console.log(`Closing connection to ${TEST_DB_NAME} database`);
  const manager = getConnectionManager();
  await Promise.all(
    manager.connections
      .filter((conn) => conn.isConnected)
      .map(async (conn) => conn.close()),
  );
};
