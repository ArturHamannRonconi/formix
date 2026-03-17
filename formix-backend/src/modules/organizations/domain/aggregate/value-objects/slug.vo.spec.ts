import { Slug } from './slug.vo';
import { DomainError } from '@shared/domain-error';

describe('Slug VO', () => {
  describe('create()', () => {
    it('should create a valid slug', () => {
      const slug = Slug.create('my-org-name');
      expect(slug.getValue()).toBe('my-org-name');
    });

    it('should create a slug with numbers', () => {
      const slug = Slug.create('org-123');
      expect(slug.getValue()).toBe('org-123');
    });

    it('should throw DomainError for uppercase letters', () => {
      expect(() => Slug.create('My-Org')).toThrow(DomainError);
    });

    it('should throw DomainError for slug with leading hyphen', () => {
      expect(() => Slug.create('-my-org')).toThrow(DomainError);
    });

    it('should throw DomainError for slug with trailing hyphen', () => {
      expect(() => Slug.create('my-org-')).toThrow(DomainError);
    });

    it('should throw DomainError for slug with consecutive hyphens', () => {
      expect(() => Slug.create('my--org')).toThrow(DomainError);
    });

    it('should throw DomainError for empty string', () => {
      expect(() => Slug.create('')).toThrow(DomainError);
    });

    it('should throw DomainError for special characters', () => {
      expect(() => Slug.create('my org')).toThrow(DomainError);
      expect(() => Slug.create('my_org')).toThrow(DomainError);
    });
  });

  describe('fromName()', () => {
    it('should convert a simple name to slug', () => {
      const slug = Slug.fromName('My Organization');
      expect(slug.getValue()).toBe('my-organization');
    });

    it('should remove accents', () => {
      const slug = Slug.fromName('Organização Técnica');
      expect(slug.getValue()).toBe('organizacao-tecnica');
    });

    it('should handle multiple spaces', () => {
      const slug = Slug.fromName('My   Big   Company');
      expect(slug.getValue()).toBe('my-big-company');
    });

    it('should remove special characters', () => {
      const slug = Slug.fromName('My Company & Partners!');
      expect(slug.getValue()).toBe('my-company-partners');
    });

    it('should handle already lowercase name', () => {
      const slug = Slug.fromName('simple name');
      expect(slug.getValue()).toBe('simple-name');
    });
  });
});
