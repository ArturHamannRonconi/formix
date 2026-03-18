import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import mongoose from 'mongoose';
import * as request from 'supertest';
import { UsersController } from './users.controller';
import { GetProfileUseCase } from '@modules/users/domain/usecases/get-profile.usecase';
import { UpdateProfileUseCase } from '@modules/users/domain/usecases/update-profile.usecase';
import { MongoUserRepository } from '@modules/users/infra/repositories/mongo-user.repository';
import { USER_REPOSITORY } from '@modules/users/domain/repositories/user.repository';
import { UserSchemaClass, UserSchema } from '@modules/users/infra/schemas/user.schema';
import { JwtStrategy } from '@modules/auth/infra/strategies/jwt.strategy';
import { JwtAuthGuard } from '@modules/auth/infra/guards/jwt-auth.guard';
import { User } from '@modules/users/domain/aggregate/user.aggregate';
import { Email } from '@shared/value-objects/email.vo';
import { Password } from '@shared/value-objects/password.vo';

const TEST_SECRET = 'default-secret';

describe('UsersController (integration)', () => {
  let mongod: MongoMemoryServer;
  let app: INestApplication;
  let jwtService: JwtService;
  let user: User;
  let accessToken: string;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: UserSchemaClass.name, schema: UserSchema }]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({ secret: TEST_SECRET, signOptions: { expiresIn: '15m' } }),
      ],
      controllers: [UsersController],
      providers: [
        GetProfileUseCase,
        UpdateProfileUseCase,
        { provide: USER_REPOSITORY, useClass: MongoUserRepository },
        JwtStrategy,
        JwtAuthGuard,
        { provide: APP_GUARD, useClass: JwtAuthGuard },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    jwtService = module.get(JwtService);

    const userRepo = module.get(USER_REPOSITORY);
    user = User.create({
      name: 'Test User',
      email: Email.create('test@example.com'),
      passwordHash: await Password.create('TestPass1'),
    });
    await userRepo.save(user);

    accessToken = jwtService.sign({
      sub: user.id.getValue(),
      organizationId: 'org-id',
      role: 'admin',
    });
  });

  afterAll(async () => {
    await app.close();
    await mongoose.disconnect();
    await mongod.stop();
  });

  describe('GET /users/me', () => {
    it('should return 200 with user profile (no passwordHash)', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(user.id.getValue());
      expect(response.body.name).toBe('Test User');
      expect(response.body.email).toBe('test@example.com');
      expect(response.body.emailConfirmed).toBe(false);
      expect(response.body.passwordHash).toBeUndefined();
    });

    it('should return 401 without token', async () => {
      const response = await request(app.getHttpServer()).get('/users/me');
      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /users/me', () => {
    it('should return 200 when updating name', async () => {
      const response = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(200);
      expect(response.body.updated).toBe(true);
    });

    it('should return 200 when updating password with correct current password', async () => {
      const response = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ currentPassword: 'TestPass1', newPassword: 'NewPass1234' });

      expect(response.status).toBe(200);
      expect(response.body.updated).toBe(true);
    });

    it('should return 400 when current password is incorrect', async () => {
      const response = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ currentPassword: 'WrongPass1', newPassword: 'NewPass1234' });

      expect(response.status).toBe(400);
    });

    it('should return 401 without token', async () => {
      const response = await request(app.getHttpServer())
        .patch('/users/me')
        .send({ name: 'New Name' });

      expect(response.status).toBe(401);
    });
  });
});
