import { QuestionEntity } from './question.entity';

const makeValidInput = (overrides = {}) => ({
  formId: 'form-123',
  organizationId: 'org-123',
  type: 'text',
  label: 'What is your name?',
  required: false,
  order: 0,
  ...overrides,
});

describe('QuestionEntity', () => {
  describe('create()', () => {
    it('should create a valid question', () => {
      const question = QuestionEntity.create(makeValidInput());
      expect(question.label).toBe('What is your name?');
      expect(question.type.getValue()).toBe('text');
      expect(question.required).toBe(false);
      expect(question.order).toBe(0);
      expect(question.id).toBeDefined();
      expect(question.createdAt).toBeInstanceOf(Date);
    });

    it('should throw when label is empty', () => {
      expect(() => QuestionEntity.create(makeValidInput({ label: '' }))).toThrow(
        'Question label is required',
      );
    });

    it('should throw when formId is empty', () => {
      expect(() => QuestionEntity.create(makeValidInput({ formId: '' }))).toThrow(
        'formId is required',
      );
    });
  });

  describe('validateForType()', () => {
    it('should reject radio without options', () => {
      expect(() =>
        QuestionEntity.create(makeValidInput({ type: 'radio', options: [] })),
      ).toThrow("Question type 'radio' requires at least one option");
    });

    it('should reject checkbox without options', () => {
      expect(() =>
        QuestionEntity.create(makeValidInput({ type: 'checkbox', options: [] })),
      ).toThrow("Question type 'checkbox' requires at least one option");
    });

    it('should reject dropdown without options', () => {
      expect(() =>
        QuestionEntity.create(makeValidInput({ type: 'dropdown', options: [] })),
      ).toThrow("Question type 'dropdown' requires at least one option");
    });

    it('should reject radio when options is undefined', () => {
      expect(() =>
        QuestionEntity.create(makeValidInput({ type: 'radio' })),
      ).toThrow("Question type 'radio' requires at least one option");
    });

    it('should allow text type without options', () => {
      expect(() =>
        QuestionEntity.create(makeValidInput({ type: 'text' })),
      ).not.toThrow();
    });

    it('should allow radio with options', () => {
      expect(() =>
        QuestionEntity.create(makeValidInput({ type: 'radio', options: ['Yes', 'No'] })),
      ).not.toThrow();
    });
  });

  describe('update()', () => {
    it('should update the label', () => {
      const question = QuestionEntity.create(makeValidInput());
      question.update({ label: 'Updated label' });
      expect(question.label).toBe('Updated label');
    });

    it('should update required field', () => {
      const question = QuestionEntity.create(makeValidInput());
      question.update({ required: true });
      expect(question.required).toBe(true);
    });

    it('should not change unspecified fields', () => {
      const question = QuestionEntity.create(makeValidInput({ order: 5 }));
      question.update({ label: 'New label' });
      expect(question.order).toBe(5);
    });
  });
});
