import { RefreshTokenEntity } from './refresh-token.entity';

describe('RefreshTokenEntity', () => {
  it('should create with unique tokenHash and family', () => {
    const token = RefreshTokenEntity.create(86400000);
    expect(token.tokenHash).toBeDefined();
    expect(token.family).toBeDefined();
    expect(token.rawToken).toBeDefined();
    expect(token.wasUsed()).toBe(false);
    expect(token.isExpired()).toBe(false);
  });

  it('should create with existing family', () => {
    const family = 'test-family-uuid';
    const token = RefreshTokenEntity.createWithFamily(family, 86400000);
    expect(token.family).toBe(family);
  });

  it('should mark as used', () => {
    const token = RefreshTokenEntity.create(86400000);
    expect(token.wasUsed()).toBe(false);
    token.markAsUsed();
    expect(token.wasUsed()).toBe(true);
    expect(token.usedAt).not.toBeNull();
  });

  it('should detect expired token', () => {
    const token = RefreshTokenEntity.create(-1000);
    expect(token.isExpired()).toBe(true);
  });

  it('should reconstitute with same data', () => {
    const original = RefreshTokenEntity.create(86400000);
    const reconstituted = RefreshTokenEntity.reconstitute({
      id: original.id,
      tokenHash: original.tokenHash,
      family: original.family,
      usedAt: null,
      expiresAt: original.expiresAt,
      createdAt: original.createdAt,
    });
    expect(reconstituted.tokenHash).toBe(original.tokenHash);
    expect(reconstituted.rawToken).toBeUndefined();
  });
});
