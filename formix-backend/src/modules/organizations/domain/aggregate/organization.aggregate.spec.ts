import { Organization } from './organization.aggregate';
import { OrganizationId } from './value-objects/organization-id.vo';
import { UserId } from '@modules/users/domain/aggregate/value-objects/user-id.vo';
import { Slug } from './value-objects/slug.vo';
import { MemberRole } from './value-objects/member-role.enum';
import { DomainError } from '@shared/domain-error';

describe('Organization Aggregate', () => {
  const adminId = UserId.from('admin-user-id');
  const slug = Slug.create('acme-corp');

  describe('create()', () => {
    it('should create an organization with an initial admin member', () => {
      const org = Organization.create({ name: 'Acme Corp', slug, initialAdminId: adminId });

      expect(org.id).toBeInstanceOf(OrganizationId);
      expect(org.name).toBe('Acme Corp');
      expect(org.members).toHaveLength(1);
      expect(org.members[0].userId.equals(adminId)).toBe(true);
      expect(org.members[0].isAdmin()).toBe(true);
    });
  });

  describe('reconstitute()', () => {
    it('should reconstitute from stored data', () => {
      const now = new Date();
      const org = Organization.reconstitute({
        id: OrganizationId.from('org-id'),
        name: 'Acme',
        slug,
        members: [],
        createdAt: now,
        updatedAt: now,
      });

      expect(org.id.getValue()).toBe('org-id');
    });
  });

  describe('addMember()', () => {
    it('should add a new member', () => {
      const org = Organization.create({ name: 'Acme', slug, initialAdminId: adminId });
      const newUserId = UserId.from('new-user-id');

      org.addMember(newUserId, MemberRole.MEMBER);

      expect(org.members).toHaveLength(2);
      expect(org.findMemberByUserId(newUserId)).not.toBeNull();
    });

    it('should throw DomainError when user is already a member', () => {
      const org = Organization.create({ name: 'Acme', slug, initialAdminId: adminId });
      expect(() => org.addMember(adminId, MemberRole.MEMBER)).toThrow(DomainError);
    });
  });

  describe('removeMember()', () => {
    it('should remove a non-admin member', () => {
      const org = Organization.create({ name: 'Acme', slug, initialAdminId: adminId });
      const memberId = UserId.from('member-user-id');
      org.addMember(memberId, MemberRole.MEMBER);

      org.removeMember(memberId);

      expect(org.findMemberByUserId(memberId)).toBeNull();
    });

    it('should throw DomainError when removing the last admin', () => {
      const org = Organization.create({ name: 'Acme', slug, initialAdminId: adminId });
      expect(() => org.removeMember(adminId)).toThrow(DomainError);
    });
  });
});
