import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule as MongooseRootModule } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { MongoUserRepository } from './mongo-user.repository';
import { UserSchemaClass, UserSchema, UserDocument } from '../schemas/user.schema';
import { User } from '@modules/users/domain/aggregate/user.aggregate';
import { UserId } from '@modules/users/domain/aggregate/value-objects/user-id.vo';
import { EmailConfirmationTokenEntity } from '@modules/users/domain/aggregate/entities/email-confirmation-token.entity';
import { Email } from '@shared/value-objects/email.vo';
import { Password } from '@shared/value-objects/password.vo';

describe('MongoUserRepository (integration)', () => {
  let mongod: MongoMemoryServer;
  let module: TestingModule;
  let repository: MongoUserRepository;
  let userModel: Model<UserDocument>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    module = await Test.createTestingModule({
      imports: [
        MongooseRootModule.forRoot(uri),
        MongooseModule.forFeature([{ name: UserSchemaClass.name, schema: UserSchema }]),
      ],
      providers: [MongoUserRepository],
    }).compile();

    repository = module.get<MongoUserRepository>(MongoUserRepository);
    userModel = module.get<Model<UserDocument>>(getModelToken(UserSchemaClass.name));
  });

  afterAll(async () => {
    await module.close();
    await mongoose.disconnect();
    await mongod.stop();
  });

  afterEach(async () => {
    await userModel.deleteMany({});
  });

  async function createTestUser(emailStr = 'test@example.com'): Promise<User> {
    const email = Email.create(emailStr);
    const password = await Password.create('SecurePass1');
    return User.create({ name: 'Test User', email, passwordHash: password });
  }

  describe('save()', () => {
    it('should save a new user', async () => {
      const user = await createTestUser();
      await repository.save(user);

      const doc = await userModel.findById(user.id.getValue());
      expect(doc).not.toBeNull();
      expect(doc!.email).toBe('test@example.com');
      expect(doc!.emailConfirmationToken).toBeNull();
    });

    it('should save user with emailConfirmationToken embedded', async () => {
      const user = await createTestUser();
      const token = EmailConfirmationTokenEntity.create(86400000);
      user.setEmailConfirmationToken(token);
      await repository.save(user);

      const doc = await userModel.findById(user.id.getValue());
      expect(doc!.emailConfirmationToken).not.toBeNull();
      expect(doc!.emailConfirmationToken!.tokenHash).toBe(token.tokenHash);
    });

    it('should update an existing user', async () => {
      const user = await createTestUser();
      await repository.save(user);

      user.updateName('Updated Name');
      await repository.save(user);

      const doc = await userModel.findById(user.id.getValue());
      expect(doc!.name).toBe('Updated Name');
    });
  });

  describe('findById()', () => {
    it('should find a user by id', async () => {
      const user = await createTestUser();
      await repository.save(user);

      const result = await repository.findById(user.id);
      expect(result.isFailure).toBe(false);
      expect(result.value.email.getValue()).toBe('test@example.com');
    });

    it('should return failure if user not found', async () => {
      const result = await repository.findById(UserId.from('non-existent-uuid'));
      expect(result.isFailure).toBe(true);
    });
  });

  describe('findByEmail()', () => {
    it('should find a user by email', async () => {
      const user = await createTestUser();
      await repository.save(user);

      const result = await repository.findByEmail(Email.create('test@example.com'));
      expect(result.isFailure).toBe(false);
      expect(result.value.name).toBe('Test User');
    });

    it('should return failure if email not found', async () => {
      const result = await repository.findByEmail(Email.create('notfound@example.com'));
      expect(result.isFailure).toBe(true);
    });
  });

  describe('findByEmailConfirmationTokenHash()', () => {
    it('should find a user by email confirmation token hash', async () => {
      const user = await createTestUser();
      const token = EmailConfirmationTokenEntity.create(86400000);
      user.setEmailConfirmationToken(token);
      await repository.save(user);

      const result = await repository.findByEmailConfirmationTokenHash(token.tokenHash);
      expect(result.isFailure).toBe(false);
      expect(result.value.email.getValue()).toBe('test@example.com');
      expect(result.value.emailConfirmationToken).not.toBeNull();
    });

    it('should return failure when hash not found', async () => {
      const result = await repository.findByEmailConfirmationTokenHash('nonexistent-hash');
      expect(result.isFailure).toBe(true);
    });
  });

  describe('exists()', () => {
    it('should return true if email exists', async () => {
      const user = await createTestUser();
      await repository.save(user);

      const result = await repository.exists(Email.create('test@example.com'));
      expect(result).toBe(true);
    });

    it('should return false if email does not exist', async () => {
      const result = await repository.exists(Email.create('notfound@example.com'));
      expect(result).toBe(false);
    });
  });
});
