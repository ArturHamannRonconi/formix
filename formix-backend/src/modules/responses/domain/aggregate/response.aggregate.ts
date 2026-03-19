import { ResponseId } from './value-objects/response-id.vo';

export interface Answer {
  questionId: string;
  value: unknown;
}

interface ResponseProps {
  id: ResponseId;
  formId: string;
  organizationId: string;
  answers: Answer[];
  submittedAt: Date;
}

export interface CreateResponseInput {
  formId: string;
  organizationId: string;
  answers: Answer[];
}

export class ResponseAggregate {
  private props: ResponseProps;

  private constructor(props: ResponseProps) {
    this.props = props;
  }

  static create(input: CreateResponseInput): ResponseAggregate {
    if (!input.formId?.trim()) throw new Error('formId is required');
    if (!input.organizationId?.trim()) throw new Error('organizationId is required');

    return new ResponseAggregate({
      id: ResponseId.create(),
      formId: input.formId,
      organizationId: input.organizationId,
      answers: input.answers,
      submittedAt: new Date(),
    });
  }

  static reconstitute(props: ResponseProps): ResponseAggregate {
    return new ResponseAggregate(props);
  }

  get id(): ResponseId {
    return this.props.id;
  }

  get formId(): string {
    return this.props.formId;
  }

  get organizationId(): string {
    return this.props.organizationId;
  }

  get answers(): Answer[] {
    return this.props.answers;
  }

  get submittedAt(): Date {
    return this.props.submittedAt;
  }
}
