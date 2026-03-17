import { User } from './user.entity';
import { Email } from '@shared/value-objects/email.vo';
import { Password } from '@shared/value-objects/password.vo';
import { DomainError } from '@shared/domain-error';

describe('User Entity', () => {
  let email: Email;
  let password: Password;

  beforeEach(async () => {
    email = Email.create('user@example.com');
    password = await Password.create('SecurePass1');
  });

  describe('create()', () => {
    it('should create a user with emailConfirmed=false and timestamps', () => {
      const user = User.create({ name: 'John Doe', email, passwordHash: password });

      expect(user.id).toBeDefined();
      expect(user.name).toBe('John Doe');
      expect(user.email.getValue()).toBe('user@example.com');
      expect(user.emailConfirmed).toBe(false);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('reconstitute()', () => {
    it('should reconstitute a user from stored data', () => {
      const now = new Date();
      const user = User.reconstitute({
        id: 'some-id',
        name: 'Jane Doe',
        email,
        passwordHash: password,
        emailConfirmed: true,
        createdAt: now,
        updatedAt: now,
      });

      expect(user.id).toBe('some-id');
      expect(user.emailConfirmed).toBe(true);
    });
  });

  describe('confirmEmail()', () => {
    it('should set emailConfirmed to true', () => {
      const user = User.create({ name: 'John', email, passwordHash: password });
      expect(user.emailConfirmed).toBe(false);
      user.confirmEmail();
      expect(user.emailConfirmed).toBe(true);
    });
  });

  describe('updateName()', () => {
    it('should update the name', () => {
      const user = User.create({ name: 'Old Name', email, passwordHash: password });
      user.updateName('New Name');
      expect(user.name).toBe('New Name');
    });

    it('should throw DomainError when name is empty', () => {
      const user = User.create({ name: 'Old Name', email, passwordHash: password });
      expect(() => user.updateName('')).toThrow(DomainError);
    });

    it('should throw DomainError when name is only whitespace', () => {
      const user = User.create({ name: 'Old Name', email, passwordHash: password });
      expect(() => user.updateName('   ')).toThrow(DomainError);
    });
  });

  describe('updatePassword()', () => {
    it('should update the password hash', async () => {
      const user = User.create({ name: 'John', email, passwordHash: password });
      const newPassword = await Password.create('NewSecure1');
      user.updatePassword(newPassword);
      expect(user.passwordHash.getHash()).toBe(newPassword.getHash());
    });
  });
});
