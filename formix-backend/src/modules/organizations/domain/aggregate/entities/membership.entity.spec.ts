import { MembershipEntity } from './membership.entity';
import { MemberRole } from '../value-objects/member-role.enum';
import { MembershipId } from '../value-objects/membership-id.vo';
import { UserId } from '@modules/users/domain/aggregate/value-objects/user-id.vo';

describe('MembershipEntity', () => {
  const userId = UserId.from('user-id-123');

  describe('create()', () => {
    it('should create a membership with generated id', () => {
      const membership = MembershipEntity.create({ userId, role: MemberRole.ADMIN });

      expect(membership.id).toBeInstanceOf(MembershipId);
      expect(membership.userId.equals(userId)).toBe(true);
      expect(membership.role).toBe(MemberRole.ADMIN);
      expect(membership.isAdmin()).toBe(true);
      expect(membership.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('reconstitute()', () => {
    it('should reconstitute from stored data', () => {
      const now = new Date();
      const membership = MembershipEntity.reconstitute({
        id: MembershipId.from('membership-id'),
        userId,
        role: MemberRole.MEMBER,
        createdAt: now,
      });

      expect(membership.id.getValue()).toBe('membership-id');
      expect(membership.isAdmin()).toBe(false);
    });
  });

  describe('isAdmin()', () => {
    it('should return true for admin role', () => {
      const m = MembershipEntity.create({ userId, role: MemberRole.ADMIN });
      expect(m.isAdmin()).toBe(true);
    });

    it('should return false for member role', () => {
      const m = MembershipEntity.create({ userId, role: MemberRole.MEMBER });
      expect(m.isAdmin()).toBe(false);
    });
  });
});
