export enum QuestionTypeEnum {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  TOGGLE = 'toggle',
  DROPDOWN = 'dropdown',
  NUMBER = 'number',
  DATE = 'date',
  RATING = 'rating',
  FILE = 'file',
  EMAIL = 'email',
}

const TYPES_REQUIRING_OPTIONS = new Set<QuestionTypeEnum>([
  QuestionTypeEnum.CHECKBOX,
  QuestionTypeEnum.RADIO,
  QuestionTypeEnum.DROPDOWN,
]);

export class QuestionType {
  private constructor(private readonly value: QuestionTypeEnum) {}

  static from(value: string): QuestionType {
    if (!Object.values(QuestionTypeEnum).includes(value as QuestionTypeEnum)) {
      throw new Error(`Invalid question type: ${value}`);
    }
    return new QuestionType(value as QuestionTypeEnum);
  }

  requiresOptions(): boolean {
    return TYPES_REQUIRING_OPTIONS.has(this.value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: QuestionType): boolean {
    return this.value === other.value;
  }
}
