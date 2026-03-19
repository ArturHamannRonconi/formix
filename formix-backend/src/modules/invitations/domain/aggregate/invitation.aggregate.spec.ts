import { Invitation } from './invitation.aggregate';

describe('InvitationAggregate', () => {
  const defaultProps = {
    organizationId: 'org-id',
    email: 'user@example.com',
    role: 'member' as const,
    expiresInMs: 604800000,
  };

  describe('create()', () => {
    it('should create invitation with pending status', () => {
      const invitation = Invitation.create(defaultProps);
      expect(invitation.status.isPending()).toBe(true);
    });

    it('should generate a rawToken on creation', () => {
      const invitation = Invitation.create(defaultProps);
      expect(invitation.rawToken).toBeDefined();
      expect(invitation.rawToken).toBeTruthy();
    });

    it('should store tokenHash as SHA-256 hash of rawToken', () => {
      const { createHash } = require('crypto');
      const invitation = Invitation.create(defaultProps);
      const expectedHash = createHash('sha256').update(invitation.rawToken!).digest('hex');
      expect(invitation.tokenHash).toBe(expectedHash);
    });

    it('should set expiresAt correctly', () => {
      const before = Date.now();
      const invitation = Invitation.create(defaultProps);
      const after = Date.now();
      const expiresAt = invitation.expiresAt.getTime();
      expect(expiresAt).toBeGreaterThanOrEqual(before + defaultProps.expiresInMs);
      expect(expiresAt).toBeLessThanOrEqual(after + defaultProps.expiresInMs);
    });

    it('should set the correct email and organizationId', () => {
      const invitation = Invitation.create(defaultProps);
      expect(invitation.email).toBe(defaultProps.email);
      expect(invitation.organizationId).toBe(defaultProps.organizationId);
    });
  });

  describe('rawToken', () => {
    it('should be undefined after reconstitution (not fresh creation)', () => {
      const fresh = Invitation.create(defaultProps);
      const reconstituted = Invitation.reconstitute({
        id: fresh.id,
        organizationId: fresh.organizationId,
        email: fresh.email,
        tokenHash: fresh.tokenHash,
        role: fresh.role,
        status: fresh.status,
        expiresAt: fresh.expiresAt,
        createdAt: fresh.createdAt,
        updatedAt: fresh.updatedAt,
      });
      expect(reconstituted.rawToken).toBeUndefined();
    });
  });

  describe('accept()', () => {
    it('should change status to accepted', () => {
      const invitation = Invitation.create(defaultProps);
      invitation.accept();
      expect(invitation.status.isAccepted()).toBe(true);
    });
  });

  describe('expire()', () => {
    it('should change status to expired', () => {
      const invitation = Invitation.create(defaultProps);
      invitation.expire();
      expect(invitation.status.getValue()).toBe('expired');
    });
  });

  describe('cancel()', () => {
    it('should change status to cancelled', () => {
      const invitation = Invitation.create(defaultProps);
      invitation.cancel();
      expect(invitation.status.getValue()).toBe('cancelled');
    });
  });

  describe('isExpired()', () => {
    it('should return false when expiresAt is in the future', () => {
      const invitation = Invitation.create(defaultProps);
      expect(invitation.isExpired()).toBe(false);
    });

    it('should return true when expiresAt is in the past', () => {
      const fresh = Invitation.create(defaultProps);
      const pastExpiry = new Date(Date.now() - 1000);
      const expired = Invitation.reconstitute({
        id: fresh.id,
        organizationId: fresh.organizationId,
        email: fresh.email,
        tokenHash: fresh.tokenHash,
        role: fresh.role,
        status: fresh.status,
        expiresAt: pastExpiry,
        createdAt: fresh.createdAt,
        updatedAt: fresh.updatedAt,
      });
      expect(expired.isExpired()).toBe(true);
    });
  });

  describe('isPending()', () => {
    it('should return true when status is pending', () => {
      const invitation = Invitation.create(defaultProps);
      expect(invitation.isPending()).toBe(true);
    });

    it('should return false after accept()', () => {
      const invitation = Invitation.create(defaultProps);
      invitation.accept();
      expect(invitation.isPending()).toBe(false);
    });
  });
});
