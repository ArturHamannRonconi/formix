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
import { InvitationsController } from './invitations.controller';
import { CreateInvitationUseCase, INVITATION_EXPIRES_IN_MS, INVITATION_APP_URL } from '@modules/invitations/domain/usecases/create-invitation.usecase';
import { AcceptInvitationUseCase, ACCEPT_INVITATION_JWT_SIGN_FUNCTION, ACCEPT_INVITATION_REFRESH_TOKEN_EXPIRES_IN_MS } from '@modules/invitations/domain/usecases/accept-invitation.usecase';
import { ListInvitationsUseCase } from '@modules/invitations/domain/usecases/list-invitations.usecase';
import { ResendInvitationUseCase, RESEND_INVITATION_EXPIRES_IN_MS, RESEND_INVITATION_APP_URL } from '@modules/invitations/domain/usecases/resend-invitation.usecase';
import { CancelInvitationUseCase } from '@modules/invitations/domain/usecases/cancel-invitation.usecase';
import { MongoInvitationRepository } from '../repositories/mongo-invitation.repository';
import { INVITATION_REPOSITORY } from '@modules/invitations/domain/repositories/invitation.repository';
import { MongoOrganizationRepository } from '@modules/organizations/infra/repositories/mongo-organization.repository';
import { ORGANIZATION_REPOSITORY } from '@modules/organizations/domain/repositories/organization.repository';
import { MongoUserRepository } from '@modules/users/infra/repositories/mongo-user.repository';
import { USER_REPOSITORY } from '@modules/users/domain/repositories/user.repository';
import { EMAIL_SERVICE } from '@shared/email/email-service.interface';
import { InvitationSchemaClass, InvitationSchema } from '../schemas/invitation.schema';
import { OrganizationSchemaClass, OrganizationSchema } from '@modules/organizations/infra/schemas/organization.schema';
import { UserSchemaClass, UserSchema } from '@modules/users/infra/schemas/user.schema';
import { JwtStrategy } from '@modules/auth/infra/strategies/jwt.strategy';
import { JwtAuthGuard } from '@modules/auth/infra/guards/jwt-auth.guard';
import { Organization } from '@modules/organizations/domain/aggregate/organization.aggregate';
import { OrganizationId } from '@modules/organizations/domain/aggregate/value-objects/organization-id.vo';
import { UserId } from '@modules/users/domain/aggregate/value-objects/user-id.vo';
import { Slug } from '@modules/organizations/domain/aggregate/value-objects/slug.vo';
import { MembershipEntity } from '@modules/organizations/domain/aggregate/entities/membership.entity';
import { MembershipId } from '@modules/organizations/domain/aggregate/value-objects/membership-id.vo';
import { MemberRole } from '@modules/organizations/domain/aggregate/value-objects/member-role.enum';
import { User } from '@modules/users/domain/aggregate/user.aggregate';
import { Email } from '@shared/value-objects/email.vo';
import { Password } from '@shared/value-objects/password.vo';
import { Invitation } from '@modules/invitations/domain/aggregate/invitation.aggregate';
import { IInvitationRepository } from '@modules/invitations/domain/repositories/invitation.repository';

const TEST_SECRET = 'default-secret';

describe('InvitationsController (integration)', () => {
  let mongod: MongoMemoryServer;
  let app: INestApplication;
  let jwtService: JwtService;
  let adminToken: string;
  let memberToken: string;
  let org: Organization;
  let adminUser: User;
  let invRepo: IInvitationRepository;
  let testModule: TestingModule;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    testModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: InvitationSchemaClass.name, schema: InvitationSchema },
          { name: OrganizationSchemaClass.name, schema: OrganizationSchema },
          { name: UserSchemaClass.name, schema: UserSchema },
        ]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({ secret: TEST_SECRET, signOptions: { expiresIn: '15m' } }),
      ],
      controllers: [InvitationsController],
      providers: [
        CreateInvitationUseCase,
        AcceptInvitationUseCase,
        ListInvitationsUseCase,
        ResendInvitationUseCase,
        CancelInvitationUseCase,
        { provide: INVITATION_REPOSITORY, useClass: MongoInvitationRepository },
        { provide: ORGANIZATION_REPOSITORY, useClass: MongoOrganizationRepository },
        { provide: USER_REPOSITORY, useClass: MongoUserRepository },
        { provide: EMAIL_SERVICE, useValue: { send: jest.fn().mockResolvedValue(undefined) } },
        { provide: INVITATION_EXPIRES_IN_MS, useValue: 604800000 },
        { provide: INVITATION_APP_URL, useValue: 'http://localhost:3000' },
        { provide: RESEND_INVITATION_EXPIRES_IN_MS, useValue: 604800000 },
        { provide: RESEND_INVITATION_APP_URL, useValue: 'http://localhost:3000' },
        {
          provide: ACCEPT_INVITATION_JWT_SIGN_FUNCTION,
          useFactory: (jwtSvc: JwtService) => jwtSvc.sign.bind(jwtSvc),
          inject: [JwtService],
        },
        { provide: ACCEPT_INVITATION_REFRESH_TOKEN_EXPIRES_IN_MS, useValue: 604800000 },
        JwtStrategy,
        JwtAuthGuard,
        { provide: APP_GUARD, useClass: JwtAuthGuard },
      ],
    }).compile();

    app = testModule.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    jwtService = testModule.get(JwtService);
    invRepo = testModule.get(INVITATION_REPOSITORY);

    const orgRepo = testModule.get(ORGANIZATION_REPOSITORY);
    const userRepo = testModule.get(USER_REPOSITORY);

    adminUser = User.create({
      name: 'Admin User',
      email: Email.create('admin@example.com'),
      passwordHash: await Password.create('AdminPass1'),
    });
    adminUser.confirmEmail();

    const memberUser = User.create({
      name: 'Member User',
      email: Email.create('member@example.com'),
      passwordHash: await Password.create('MemberPass1'),
    });
    memberUser.confirmEmail();

    await userRepo.save(adminUser);
    await userRepo.save(memberUser);

    org = Organization.reconstitute({
      id: OrganizationId.create(),
      name: 'Test Org',
      slug: Slug.create('test-org'),
      members: [
        MembershipEntity.reconstitute({
          id: MembershipId.create(),
          userId: adminUser.id,
          role: MemberRole.ADMIN,
          createdAt: new Date(),
        }),
        MembershipEntity.reconstitute({
          id: MembershipId.create(),
          userId: memberUser.id,
          role: MemberRole.MEMBER,
          createdAt: new Date(),
        }),
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await orgRepo.save(org);

    adminToken = jwtService.sign({ sub: adminUser.id.getValue(), organizationId: org.id.getValue(), role: 'admin' });
    memberToken = jwtService.sign({ sub: memberUser.id.getValue(), organizationId: org.id.getValue(), role: 'member' });
  });

  afterAll(async () => {
    await app.close();
    await mongoose.disconnect();
    await mongod.stop();
  });

  describe('POST /invitations', () => {
    it('should create invitation for admin', async () => {
      const res = await request(app.getHttpServer())
        .post('/invitations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'newuser@example.com' });

      expect(res.status).toBe(201);
      expect(res.body.invitationId).toBeDefined();
    });

    it('should return 403 for non-admin', async () => {
      const res = await request(app.getHttpServer())
        .post('/invitations')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ email: 'another@example.com' });

      expect(res.status).toBe(403);
    });

    it('should return 409 if invitation already pending', async () => {
      await request(app.getHttpServer())
        .post('/invitations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'duplicate@example.com' });

      const res = await request(app.getHttpServer())
        .post('/invitations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'duplicate@example.com' });

      expect(res.status).toBe(409);
    });

    it('should return 409 if email already a member', async () => {
      const res = await request(app.getHttpServer())
        .post('/invitations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'member@example.com' });

      expect(res.status).toBe(409);
    });

    it('should return 401 without token', async () => {
      const res = await request(app.getHttpServer())
        .post('/invitations')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /invitations', () => {
    it('should return list for admin', async () => {
      const res = await request(app.getHttpServer())
        .get('/invitations')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.invitations)).toBe(true);
    });

    it('should return 403 for non-admin', async () => {
      const res = await request(app.getHttpServer())
        .get('/invitations')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('POST /invitations/:id/resend', () => {
    it('should resend an invitation', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/invitations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'resend@example.com' });

      const invitationId = createRes.body.invitationId;

      const res = await request(app.getHttpServer())
        .post(`/invitations/${invitationId}/resend`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.resent).toBe(true);
    });

    it('should return 403 for non-admin', async () => {
      const res = await request(app.getHttpServer())
        .post('/invitations/some-id/resend')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
    });

    it('should return 404 for non-existent invitation', async () => {
      const res = await request(app.getHttpServer())
        .post('/invitations/00000000-0000-0000-0000-000000000000/resend')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /invitations/:id', () => {
    it('should cancel a pending invitation', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/invitations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'cancel@example.com' });

      const invitationId = createRes.body.invitationId;

      const res = await request(app.getHttpServer())
        .delete(`/invitations/${invitationId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.cancelled).toBe(true);
    });

    it('should return 403 for non-admin', async () => {
      const res = await request(app.getHttpServer())
        .delete('/invitations/some-id')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
    });

    it('should return 400 if invitation is not pending', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/invitations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'alreadycancelled@example.com' });

      const invitationId = createRes.body.invitationId;

      await request(app.getHttpServer())
        .delete(`/invitations/${invitationId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      const res = await request(app.getHttpServer())
        .delete(`/invitations/${invitationId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });
  });

  describe('POST /invitations/accept', () => {
    it('should return 400 for invalid token', async () => {
      const res = await request(app.getHttpServer())
        .post('/invitations/accept')
        .send({ token: 'invalid-token' });

      expect(res.status).toBe(400);
    });

    it('should accept invitation for new user', async () => {
      const inv = Invitation.create({
        organizationId: org.id.getValue(),
        email: `newacceptuser-${Date.now()}@example.com`,
        expiresInMs: 604800000,
      });
      await invRepo.save(inv);

      const res = await request(app.getHttpServer())
        .post('/invitations/accept')
        .send({ token: inv.rawToken, name: 'New User', password: 'SecurePass1' });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it('should accept invitation for existing user', async () => {
      const inv = Invitation.create({
        organizationId: org.id.getValue(),
        email: 'admin@example.com',
        expiresInMs: 604800000,
      });
      await invRepo.save(inv);

      const res = await request(app.getHttpServer())
        .post('/invitations/accept')
        .send({ token: inv.rawToken });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
    });

    it('should return 400 if new user is missing name/password', async () => {
      const inv = Invitation.create({
        organizationId: org.id.getValue(),
        email: `nopassword-${Date.now()}@example.com`,
        expiresInMs: 604800000,
      });
      await invRepo.save(inv);

      const res = await request(app.getHttpServer())
        .post('/invitations/accept')
        .send({ token: inv.rawToken });

      expect(res.status).toBe(400);
    });
  });
});
