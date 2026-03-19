import { ResponseEmailAggregate } from './response-email.aggregate';
import { ResponseEmailId } from './value-objects/response-email-id.vo';

describe('ResponseEmailAggregate', () => {
  describe('create', () => {
    it('should create with formId and emailHash', () => {
      const re = ResponseEmailAggregate.create('form-123', 'abc123hash');
      expect(re.formId).toBe('form-123');
      expect(re.emailHash).toBe('abc123hash');
      expect(re.id).toBeDefined();
      expect(re.respondedAt).toBeInstanceOf(Date);
    });

    it('should throw if formId is missing', () => {
      expect(() => ResponseEmailAggregate.create('', 'hash')).toThrow('formId is required');
    });

    it('should throw if emailHash is missing', () => {
      expect(() => ResponseEmailAggregate.create('form-123', '')).toThrow('emailHash is required');
    });

    it('should NOT have responseId or any response reference', () => {
      const re = ResponseEmailAggregate.create('form-123', 'hash');
      const props = re as unknown as Record<string, unknown>;
      expect(props['responseId']).toBeUndefined();
      expect(props['email']).toBeUndefined();
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute from persisted data', () => {
      const id = ResponseEmailId.create();
      const respondedAt = new Date('2026-01-01');
      const re = ResponseEmailAggregate.reconstitute({
        id,
        formId: 'form-abc',
        emailHash: 'hashvalue',
        respondedAt,
      });
      expect(re.id.getValue()).toBe(id.getValue());
      expect(re.formId).toBe('form-abc');
      expect(re.emailHash).toBe('hashvalue');
      expect(re.respondedAt).toBe(respondedAt);
    });
  });
});
