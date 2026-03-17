import { Membership } from './membership.entity';
import { MemberRole } from '../value-objects/member-role.enum';

describe('Membership Entity', () => {
  describe('create()', () => {
    it('should create a membership', () => {
      const membership = Membership.create({
        userId: 'user-1',
        organizationId: 'org-1',
        role: MemberRole.ADMIN,
      });

      expect(membership.id).toBeDefined();
      expect(membership.userId).toBe('user-1');
      expect(membership.organizationId).toBe('org-1');
      expect(membership.role).toBe(MemberRole.ADMIN);
      expect(membership.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('reconstitute()', () => {
    it('should reconstitute a membership from stored data', () => {
      const now = new Date();
      const membership = Membership.reconstitute({
        id: 'mem-id-1',
        userId: 'user-1',
        organizationId: 'org-1',
        role: MemberRole.MEMBER,
        createdAt: now,
      });

      expect(membership.id).toBe('mem-id-1');
      expect(membership.role).toBe(MemberRole.MEMBER);
    });
  });

  describe('isAdmin()', () => {
    it('should return true for ADMIN role', () => {
      const membership = Membership.create({
        userId: 'user-1',
        organizationId: 'org-1',
        role: MemberRole.ADMIN,
      });
      expect(membership.isAdmin()).toBe(true);
    });

    it('should return false for MEMBER role', () => {
      const membership = Membership.create({
        userId: 'user-1',
        organizationId: 'org-1',
        role: MemberRole.MEMBER,
      });
      expect(membership.isAdmin()).toBe(false);
    });
  });
});
