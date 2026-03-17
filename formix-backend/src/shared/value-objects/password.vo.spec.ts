import { Password } from './password.vo';
import { DomainError } from '../domain-error';

describe('Password VO', () => {
  it('should create a valid password with hash', async () => {
    const password = await Password.create('MyPassword1');
    expect(password.getHash()).toBeDefined();
    expect(password.getHash()).not.toBe('MyPassword1');
  });

  it('should reject a password shorter than 8 characters', async () => {
    await expect(Password.create('Ab1')).rejects.toThrow(DomainError);
  });

  it('should reject a password without numbers', async () => {
    await expect(Password.create('MyPassword')).rejects.toThrow(DomainError);
  });

  it('should reject a password without letters', async () => {
    await expect(Password.create('12345678')).rejects.toThrow(DomainError);
  });

  it('should return true for correct compare', async () => {
    const password = await Password.create('SecurePass1');
    const result = await password.compare('SecurePass1');
    expect(result).toBe(true);
  });

  it('should return false for incorrect compare', async () => {
    const password = await Password.create('SecurePass1');
    const result = await password.compare('WrongPass1');
    expect(result).toBe(false);
  });

  it('should reconstitute from hash without validation', () => {
    const hash = '$2b$10$hashedvalue';
    const password = Password.fromHash(hash);
    expect(password.getHash()).toBe(hash);
  });
});
