import { FormAggregate } from './form.aggregate';
import { PublicToken } from './value-objects/public-token.vo';

const makeCreateInput = (overrides = {}) => ({
  organizationId: 'org-123',
  createdBy: 'user-123',
  title: 'Customer Satisfaction Survey',
  ...overrides,
});

describe('FormAggregate', () => {
  describe('create()', () => {
    it('should create a form with draft status', () => {
      const form = FormAggregate.create(makeCreateInput());
      expect(form.status.isDraft()).toBe(true);
      expect(form.status.getValue()).toBe('draft');
    });

    it('should create a form with default settings', () => {
      const form = FormAggregate.create(makeCreateInput());
      expect(form.settings.allowMultipleResponses).toBe(false);
      expect(form.settings.allowedEmailDomains).toEqual([]);
      expect(form.settings.expiresAt).toBeUndefined();
      expect(form.settings.maxResponses).toBeUndefined();
    });

    it('should set title and organizationId', () => {
      const form = FormAggregate.create(makeCreateInput());
      expect(form.title).toBe('Customer Satisfaction Survey');
      expect(form.organizationId).toBe('org-123');
      expect(form.createdBy).toBe('user-123');
    });

    it('should have no publicToken initially', () => {
      const form = FormAggregate.create(makeCreateInput());
      expect(form.publicToken).toBeUndefined();
    });

    it('should throw when title is empty', () => {
      expect(() => FormAggregate.create(makeCreateInput({ title: '' }))).toThrow(
        'Form title is required',
      );
    });
  });

  describe('publish()', () => {
    it('should change status to active and set publicToken', () => {
      const form = FormAggregate.create(makeCreateInput());
      const token = PublicToken.generate();
      form.publish(token);
      expect(form.status.isActive()).toBe(true);
      expect(form.publicToken).toBe(token);
    });

    it('should throw if form is not in draft status', () => {
      const form = FormAggregate.create(makeCreateInput());
      const token = PublicToken.generate();
      form.publish(token);
      expect(() => form.publish(PublicToken.generate())).toThrow(
        'Form can only be published from draft status',
      );
    });
  });

  describe('close()', () => {
    it('should change status to closed', () => {
      const form = FormAggregate.create(makeCreateInput());
      form.publish(PublicToken.generate());
      form.close();
      expect(form.status.isClosed()).toBe(true);
    });

    it('should throw if form is not active', () => {
      const form = FormAggregate.create(makeCreateInput());
      expect(() => form.close()).toThrow('Form can only be closed from active status');
    });
  });

  describe('isExpired()', () => {
    it('should return false when expiresAt is not set', () => {
      const form = FormAggregate.create(makeCreateInput());
      expect(form.isExpired()).toBe(false);
    });

    it('should return true when expiresAt is in the past', () => {
      const form = FormAggregate.create(makeCreateInput());
      form.update({ settings: { expiresAt: new Date(Date.now() - 1000) } });
      expect(form.isExpired()).toBe(true);
    });

    it('should return false when expiresAt is in the future', () => {
      const form = FormAggregate.create(makeCreateInput());
      form.update({ settings: { expiresAt: new Date(Date.now() + 60000) } });
      expect(form.isExpired()).toBe(false);
    });
  });

  describe('canAcceptResponses()', () => {
    it('should return false when form is in draft status', () => {
      const form = FormAggregate.create(makeCreateInput());
      expect(form.canAcceptResponses()).toBe(false);
    });

    it('should return true when form is active and not expired', () => {
      const form = FormAggregate.create(makeCreateInput());
      form.publish(PublicToken.generate());
      expect(form.canAcceptResponses()).toBe(true);
    });

    it('should return false when form is active but expired', () => {
      const form = FormAggregate.create(makeCreateInput());
      form.publish(PublicToken.generate());
      form.update({ settings: { expiresAt: new Date(Date.now() - 1000) } });
      expect(form.canAcceptResponses()).toBe(false);
    });
  });
});
