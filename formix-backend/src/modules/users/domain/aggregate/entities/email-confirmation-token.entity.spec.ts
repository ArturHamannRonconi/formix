import { EmailConfirmationTokenEntity } from './email-confirmation-token.entity';
import { EmailConfirmationTokenId } from '../value-objects/email-confirmation-token-id.vo';

describe('EmailConfirmationTokenEntity', () => {
  describe('create()', () => {
    it('should create a token with generated id, tokenHash, expiresAt and createdAt', () => {
      const token = EmailConfirmationTokenEntity.create(86400000);

      expect(token.id).toBeInstanceOf(EmailConfirmationTokenId);
      expect(token.tokenHash).toMatch(/^[a-f0-9]{64}$/);
      expect(token.expiresAt).toBeInstanceOf(Date);
      expect(token.createdAt).toBeInstanceOf(Date);
    });

    it('should set expiresAt to now + expiresInMs', () => {
      const expiresInMs = 3600000;
      const before = Date.now();
      const token = EmailConfirmationTokenEntity.create(expiresInMs);
      const after = Date.now();

      expect(token.expiresAt.getTime()).toBeGreaterThanOrEqual(before + expiresInMs);
      expect(token.expiresAt.getTime()).toBeLessThanOrEqual(after + expiresInMs);
    });

    it('should expose rawToken for sending by email', () => {
      const token = EmailConfirmationTokenEntity.create(86400000);
      expect(typeof token.rawToken).toBe('string');
    });
  });

  describe('isExpired()', () => {
    it('should return false when token has not expired', () => {
      const token = EmailConfirmationTokenEntity.create(86400000);
      expect(token.isExpired()).toBe(false);
    });

    it('should return true when token has expired', () => {
      const past = new Date(Date.now() - 1000);
      const token = EmailConfirmationTokenEntity.reconstitute({
        id: EmailConfirmationTokenId.from('some-id'),
        tokenHash: 'abc123',
        expiresAt: past,
        createdAt: new Date(Date.now() - 86400000),
      });
      expect(token.isExpired()).toBe(true);
    });
  });

  describe('reconstitute()', () => {
    it('should reconstitute from stored data', () => {
      const now = new Date();
      const future = new Date(now.getTime() + 86400000);
      const token = EmailConfirmationTokenEntity.reconstitute({
        id: EmailConfirmationTokenId.from('stored-id'),
        tokenHash: 'stored-hash',
        expiresAt: future,
        createdAt: now,
      });

      expect(token.id.getValue()).toBe('stored-id');
      expect(token.tokenHash).toBe('stored-hash');
      expect(token.rawToken).toBeUndefined();
    });
  });
});
