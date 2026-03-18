import { User } from './user.aggregate';
import { Email } from '@shared/value-objects/email.vo';
import { Password } from '@shared/value-objects/password.vo';
import { DomainError } from '@shared/domain-error';
import { UserId } from './value-objects/user-id.vo';
import { EmailConfirmationTokenEntity } from './entities/email-confirmation-token.entity';

describe('User Aggregate', () => {
  let email: Email;
  let password: Password;

  beforeEach(async () => {
    email = Email.create('user@example.com');
    password = await Password.create('SecurePass1');
  });

  describe('create()', () => {
    it('should create a user with emailConfirmed=false and no token', () => {
      const user = User.create({ name: 'John Doe', email, passwordHash: password });

      expect(user.id).toBeInstanceOf(UserId);
      expect(user.name).toBe('John Doe');
      expect(user.email.getValue()).toBe('user@example.com');
      expect(user.emailConfirmed).toBe(false);
      expect(user.emailConfirmationToken).toBeNull();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('reconstitute()', () => {
    it('should reconstitute a user from stored data', () => {
      const now = new Date();
      const user = User.reconstitute({
        id: UserId.from('some-id'),
        name: 'Jane Doe',
        email,
        passwordHash: password,
        emailConfirmed: true,
        emailConfirmationToken: null,
        createdAt: now,
        updatedAt: now,
      });

      expect(user.id.getValue()).toBe('some-id');
      expect(user.emailConfirmed).toBe(true);
    });
  });

  describe('setEmailConfirmationToken()', () => {
    it('should set the email confirmation token', () => {
      const user = User.create({ name: 'John', email, passwordHash: password });
      const token = EmailConfirmationTokenEntity.create(86400000);

      user.setEmailConfirmationToken(token);

      expect(user.emailConfirmationToken).toBe(token);
    });
  });

  describe('confirmEmail()', () => {
    it('should set emailConfirmed to true and clear the token', () => {
      const user = User.create({ name: 'John', email, passwordHash: password });
      user.setEmailConfirmationToken(EmailConfirmationTokenEntity.create(86400000));

      user.confirmEmail();

      expect(user.emailConfirmed).toBe(true);
      expect(user.emailConfirmationToken).toBeNull();
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
