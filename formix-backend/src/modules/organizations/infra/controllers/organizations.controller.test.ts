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
import { OrganizationsController } from './organizations.controller';
import { ListMembersUseCase } from '@modules/organizations/domain/usecases/list-members.usecase';
import { MongoOrganizationRepository } from '@modules/organizations/infra/repositories/mongo-organization.repository';
import { ORGANIZATION_REPOSITORY } from '@modules/organizations/domain/repositories/organization.repository';
import { MongoUserRepository } from '@modules/users/infra/repositories/mongo-user.repository';
import { USER_REPOSITORY } from '@modules/users/domain/repositories/user.repository';
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

const TEST_SECRET = 'default-secret';

describe('OrganizationsController (integration)', () => {
  let mongod: MongoMemoryServer;
  let app: INestApplication;
  let jwtService: JwtService;
  let adminUser: User;
  let memberUser: User;
  let org: Organization;
  let adminToken: string;
  let memberToken: string;
  let otherOrgToken: string;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: OrganizationSchemaClass.name, schema: OrganizationSchema },
          { name: UserSchemaClass.name, schema: UserSchema },
        ]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({ secret: TEST_SECRET, signOptions: { expiresIn: '15m' } }),
      ],
      controllers: [OrganizationsController],
      providers: [
        ListMembersUseCase,
        { provide: ORGANIZATION_REPOSITORY, useClass: MongoOrganizationRepository },
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

    const orgRepo = module.get(ORGANIZATION_REPOSITORY);
    const userRepo = module.get(USER_REPOSITORY);

    adminUser = User.create({
      name: 'Admin User',
      email: Email.create('admin@example.com'),
      passwordHash: await Password.create('AdminPass1'),
    });
    memberUser = User.create({
      name: 'Member User',
      email: Email.create('member@example.com'),
      passwordHash: await Password.create('MemberPass1'),
    });
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

    adminToken = jwtService.sign({
      sub: adminUser.id.getValue(),
      organizationId: org.id.getValue(),
      role: 'admin',
    });
    memberToken = jwtService.sign({
      sub: memberUser.id.getValue(),
      organizationId: org.id.getValue(),
      role: 'member',
    });
    otherOrgToken = jwtService.sign({
      sub: adminUser.id.getValue(),
      organizationId: 'other-org-id',
      role: 'admin',
    });
  });

  afterAll(async () => {
    await app.close();
    await mongoose.disconnect();
    await mongod.stop();
  });

  describe('GET /organizations/:orgId/members', () => {
    it('should return 200 with members list for admin', async () => {
      const response = await request(app.getHttpServer())
        .get(`/organizations/${org.id.getValue()}/members`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.members).toHaveLength(2);
      expect(response.body.members[0]).toHaveProperty('userId');
      expect(response.body.members[0]).toHaveProperty('name');
      expect(response.body.members[0]).toHaveProperty('email');
      expect(response.body.members[0]).toHaveProperty('role');
      expect(response.body.members[0]).toHaveProperty('joinedAt');
      expect(response.body.members[0]).not.toHaveProperty('passwordHash');
    });

    it('should return 200 with members list for regular member', async () => {
      const response = await request(app.getHttpServer())
        .get(`/organizations/${org.id.getValue()}/members`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(200);
      expect(response.body.members).toHaveLength(2);
    });

    it('should return 403 when orgId does not match token', async () => {
      const response = await request(app.getHttpServer())
        .get(`/organizations/${org.id.getValue()}/members`)
        .set('Authorization', `Bearer ${otherOrgToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 401 without token', async () => {
      const response = await request(app.getHttpServer())
        .get(`/organizations/${org.id.getValue()}/members`);

      expect(response.status).toBe(401);
    });
  });
});
