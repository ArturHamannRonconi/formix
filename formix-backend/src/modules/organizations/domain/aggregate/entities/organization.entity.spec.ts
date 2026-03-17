import { Organization } from './organization.entity';
import { Slug } from '../value-objects/slug.vo';

describe('Organization Entity', () => {
  let slug: Slug;

  beforeEach(() => {
    slug = Slug.create('my-org');
  });

  describe('create()', () => {
    it('should create an organization with timestamps', () => {
      const org = Organization.create('My Org', slug);
      expect(org.id).toBeDefined();
      expect(org.name).toBe('My Org');
      expect(org.slug.getValue()).toBe('my-org');
      expect(org.createdAt).toBeInstanceOf(Date);
      expect(org.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('reconstitute()', () => {
    it('should reconstitute an organization from stored data', () => {
      const now = new Date();
      const org = Organization.reconstitute({
        id: 'org-id-123',
        name: 'My Org',
        slug,
        createdAt: now,
        updatedAt: now,
      });

      expect(org.id).toBe('org-id-123');
      expect(org.name).toBe('My Org');
    });
  });

  describe('updateName()', () => {
    it('should update name and slug', () => {
      const org = Organization.create('Old Name', slug);
      const newSlug = Slug.create('new-name');
      org.updateName('New Name', newSlug);
      expect(org.name).toBe('New Name');
      expect(org.slug.getValue()).toBe('new-name');
    });
  });
});
