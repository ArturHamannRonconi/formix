import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule as MongooseRootModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import mongoose from 'mongoose';
import * as request from 'supertest';
import { AuthController } from './auth.controller';
import {
  SignupUseCase,
  JWT_SIGN_FUNCTION,
  EMAIL_CONFIRMATION_EXPIRES_IN_MS,
  APP_URL,
} from '@modules/auth/domain/usecases/signup.usecase';
import { ConfirmEmailUseCase } from '@modules/auth/domain/usecases/confirm-email.usecase';
import {
  ResendConfirmationUseCase,
  RESEND_EMAIL_CONFIRMATION_EXPIRES_IN_MS,
  RESEND_APP_URL,
} from '@modules/auth/domain/usecases/resend-confirmation.usecase';
import {
  LoginUseCase,
  LOGIN_JWT_SIGN_FUNCTION,
  REFRESH_TOKEN_EXPIRES_IN_MS,
} from '@modules/auth/domain/usecases/login.usecase';
import {
  RefreshTokenUseCase,
  REFRESH_JWT_SIGN_FUNCTION,
  REFRESH_JWT_REFRESH_SIGN_FUNCTION,
  REFRESH_TOKEN_REFRESH_EXPIRES_IN_MS,
} from '@modules/auth/domain/usecases/refresh-token.usecase';
import { LogoutUseCase } from '@modules/auth/domain/usecases/logout.usecase';
import {
  ForgotPasswordUseCase,
  FORGOT_PASSWORD_EXPIRES_IN_MS,
  FORGOT_PASSWORD_APP_URL,
} from '@modules/auth/domain/usecases/forgot-password.usecase';
import { ResetPasswordUseCase } from '@modules/auth/domain/usecases/reset-password.usecase';
import { UserSchemaClass, UserSchema } from '@modules/users/infra/schemas/user.schema';
import { MongoUserRepository } from '@modules/users/infra/repositories/mongo-user.repository';
import { USER_REPOSITORY } from '@modules/users/domain/repositories/user.repository';
import { OrganizationSchemaClass, OrganizationSchema } from '@modules/organizations/infra/schemas/organization.schema';
import { MongoOrganizationRepository } from '@modules/organizations/infra/repositories/mongo-organization.repository';
import { ORGANIZATION_REPOSITORY } from '@modules/organizations/domain/repositories/organization.repository';
import { EMAIL_SERVICE } from '@providers/email/email.provider';

describe('AuthController (integration)', () => {
  let mongod: MongoMemoryServer;
  let app: INestApplication;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseRootModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: UserSchemaClass.name, schema: UserSchema },
          { name: OrganizationSchemaClass.name, schema: OrganizationSchema },
        ]),
        JwtModule.register({ secret: 'test-secret', signOptions: { expiresIn: '15m' } }),
      ],
      controllers: [AuthController],
      providers: [
        SignupUseCase,
        ConfirmEmailUseCase,
        ResendConfirmationUseCase,
        LoginUseCase,
        RefreshTokenUseCase,
        LogoutUseCase,
        ForgotPasswordUseCase,
        ResetPasswordUseCase,
        { provide: USER_REPOSITORY, useClass: MongoUserRepository },
        { provide: ORGANIZATION_REPOSITORY, useClass: MongoOrganizationRepository },
        { provide: EMAIL_SERVICE, useValue: { send: jest.fn().mockResolvedValue(undefined) } },
        { provide: EMAIL_CONFIRMATION_EXPIRES_IN_MS, useValue: 86400000 },
        { provide: RESEND_EMAIL_CONFIRMATION_EXPIRES_IN_MS, useValue: 86400000 },
        { provide: APP_URL, useValue: 'http://localhost:3000' },
        { provide: RESEND_APP_URL, useValue: 'http://localhost:3000' },
        { provide: REFRESH_TOKEN_EXPIRES_IN_MS, useValue: 604800000 },
        { provide: REFRESH_TOKEN_REFRESH_EXPIRES_IN_MS, useValue: 604800000 },
        { provide: FORGOT_PASSWORD_EXPIRES_IN_MS, useValue: 3600000 },
        { provide: FORGOT_PASSWORD_APP_URL, useValue: 'http://localhost:3000' },
        {
          provide: JWT_SIGN_FUNCTION,
          useFactory: (jwtService: JwtService) => jwtService.sign.bind(jwtService),
          inject: [JwtService],
        },
        {
          provide: LOGIN_JWT_SIGN_FUNCTION,
          useFactory: (jwtService: JwtService) => jwtService.sign.bind(jwtService),
          inject: [JwtService],
        },
        {
          provide: REFRESH_JWT_SIGN_FUNCTION,
          useFactory: (jwtService: JwtService) => jwtService.sign.bind(jwtService),
          inject: [JwtService],
        },
        {
          provide: REFRESH_JWT_REFRESH_SIGN_FUNCTION,
          useFactory: (jwtService: JwtService) => jwtService.sign.bind(jwtService),
          inject: [JwtService],
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongoose.disconnect();
    await mongod.stop();
  });

  describe('POST /auth/signup', () => {
    it('should return 201 with userId, organizationId, accessToken and emailConfirmationRequired', async () => {
      const response = await request(app.getHttpServer()).post('/auth/signup').send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass1',
        organizationName: 'Acme Corp',
      });

      expect(response.status).toBe(201);
      expect(response.body.userId).toBeDefined();
      expect(response.body.organizationId).toBeDefined();
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.emailConfirmationRequired).toBe(true);
    });

    it('should return 409 when email already exists', async () => {
      await request(app.getHttpServer()).post('/auth/signup').send({
        name: 'John Doe',
        email: 'duplicate@example.com',
        password: 'SecurePass1',
        organizationName: 'Corp A',
      });

      const response = await request(app.getHttpServer()).post('/auth/signup').send({
        name: 'Jane Doe',
        email: 'duplicate@example.com',
        password: 'SecurePass1',
        organizationName: 'Corp B',
      });

      expect(response.status).toBe(409);
    });

    it('should return 400 when body is invalid', async () => {
      const response = await request(app.getHttpServer()).post('/auth/signup').send({
        email: 'not-an-email',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should return 401 when credentials are invalid', async () => {
      const response = await request(app.getHttpServer()).post('/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'SecurePass1',
      });

      expect(response.status).toBe(401);
    });

    it('should return 400 when email not confirmed', async () => {
      // Signup creates unconfirmed user
      await request(app.getHttpServer()).post('/auth/signup').send({
        name: 'Unconfirmed',
        email: 'unconfirmed@example.com',
        password: 'SecurePass1',
        organizationName: 'Org',
      });

      const response = await request(app.getHttpServer()).post('/auth/login').send({
        email: 'unconfirmed@example.com',
        password: 'SecurePass1',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email not confirmed');
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should return 200 even when email does not exist', async () => {
      const response = await request(app.getHttpServer()).post('/auth/forgot-password').send({
        email: 'notfound@example.com',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /auth/resend-confirmation', () => {
    it('should return 200 even when email does not exist', async () => {
      const response = await request(app.getHttpServer()).post('/auth/resend-confirmation').send({
        email: 'notfound@example.com',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
