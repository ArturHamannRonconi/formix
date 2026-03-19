import { QuestionId } from './value-objects/question-id.vo';
import { QuestionType } from './value-objects/question-type.vo';

interface QuestionValidation {
  min?: number;
  max?: number;
  pattern?: string;
}

interface QuestionProps {
  id: QuestionId;
  formId: string;
  organizationId: string;
  type: QuestionType;
  label: string;
  description?: string;
  required: boolean;
  order: number;
  options?: string[];
  validation?: QuestionValidation;
  createdAt: Date;
}

export interface CreateQuestionInput {
  formId: string;
  organizationId: string;
  type: string;
  label: string;
  description?: string;
  required: boolean;
  order: number;
  options?: string[];
  validation?: QuestionValidation;
}

export class QuestionEntity {
  private props: QuestionProps;

  private constructor(props: QuestionProps) {
    this.props = props;
  }

  static create(input: CreateQuestionInput): QuestionEntity {
    if (!input.label?.trim()) throw new Error('Question label is required');
    if (!input.formId?.trim()) throw new Error('formId is required');
    if (!input.organizationId?.trim()) throw new Error('organizationId is required');

    const type = QuestionType.from(input.type);
    const entity = new QuestionEntity({
      id: QuestionId.create(),
      formId: input.formId,
      organizationId: input.organizationId,
      type,
      label: input.label,
      description: input.description,
      required: input.required,
      order: input.order,
      options: input.options,
      validation: input.validation,
      createdAt: new Date(),
    });

    entity.validateForType();
    return entity;
  }

  static reconstitute(props: QuestionProps): QuestionEntity {
    return new QuestionEntity(props);
  }

  update(data: Partial<Omit<CreateQuestionInput, 'formId' | 'organizationId' | 'type'>>): void {
    if (data.label !== undefined) this.props.label = data.label;
    if (data.description !== undefined) this.props.description = data.description;
    if (data.required !== undefined) this.props.required = data.required;
    if (data.order !== undefined) this.props.order = data.order;
    if (data.options !== undefined) this.props.options = data.options;
    if (data.validation !== undefined) this.props.validation = data.validation;
  }

  validateForType(): void {
    if (this.props.type.requiresOptions()) {
      if (!this.props.options || this.props.options.length === 0) {
        throw new Error(
          `Question type '${this.props.type.getValue()}' requires at least one option`,
        );
      }
    }
  }

  get id(): QuestionId {
    return this.props.id;
  }

  get formId(): string {
    return this.props.formId;
  }

  get organizationId(): string {
    return this.props.organizationId;
  }

  get type(): QuestionType {
    return this.props.type;
  }

  get label(): string {
    return this.props.label;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get required(): boolean {
    return this.props.required;
  }

  get order(): number {
    return this.props.order;
  }

  get options(): string[] | undefined {
    return this.props.options;
  }

  get validation(): QuestionValidation | undefined {
    return this.props.validation;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
