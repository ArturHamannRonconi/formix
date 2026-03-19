import { ResponseAggregate } from './response.aggregate';
import { ResponseId } from './value-objects/response-id.vo';

describe('ResponseAggregate', () => {
  const validInput = {
    formId: 'form-123',
    organizationId: 'org-123',
    answers: [
      { questionId: 'q-1', value: 'Hello' },
      { questionId: 'q-2', value: 42 },
    ],
  };

  describe('create', () => {
    it('should create a response with answers', () => {
      const response = ResponseAggregate.create(validInput);
      expect(response.formId).toBe('form-123');
      expect(response.organizationId).toBe('org-123');
      expect(response.answers).toHaveLength(2);
      expect(response.answers[0].questionId).toBe('q-1');
      expect(response.answers[0].value).toBe('Hello');
      expect(response.id).toBeDefined();
      expect(response.submittedAt).toBeInstanceOf(Date);
    });

    it('should throw if formId is missing', () => {
      expect(() =>
        ResponseAggregate.create({ ...validInput, formId: '' }),
      ).toThrow('formId is required');
    });

    it('should throw if organizationId is missing', () => {
      expect(() =>
        ResponseAggregate.create({ ...validInput, organizationId: '' }),
      ).toThrow('organizationId is required');
    });

    it('should NOT have email, emailHash, userId or IP fields', () => {
      const response = ResponseAggregate.create(validInput);
      const keys = Object.keys(response);
      expect(keys).not.toContain('email');
      expect(keys).not.toContain('emailHash');
      expect(keys).not.toContain('userId');
      expect(keys).not.toContain('ip');

      // Also check the plain object returned
      const props = response as unknown as Record<string, unknown>;
      expect(props['email']).toBeUndefined();
      expect(props['emailHash']).toBeUndefined();
      expect(props['userId']).toBeUndefined();
      expect(props['ip']).toBeUndefined();
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute a response from persisted data', () => {
      const id = ResponseId.create();
      const submittedAt = new Date('2026-01-01');
      const response = ResponseAggregate.reconstitute({
        id,
        formId: 'form-abc',
        organizationId: 'org-abc',
        answers: [{ questionId: 'q-1', value: 'text' }],
        submittedAt,
      });
      expect(response.id.getValue()).toBe(id.getValue());
      expect(response.formId).toBe('form-abc');
      expect(response.submittedAt).toBe(submittedAt);
    });
  });
});
