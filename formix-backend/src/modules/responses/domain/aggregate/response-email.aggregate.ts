import { ResponseEmailId } from './value-objects/response-email-id.vo';

interface ResponseEmailProps {
  id: ResponseEmailId;
  formId: string;
  emailHash: string;
  respondedAt: Date;
}

export class ResponseEmailAggregate {
  private props: ResponseEmailProps;

  private constructor(props: ResponseEmailProps) {
    this.props = props;
  }

  static create(formId: string, emailHash: string): ResponseEmailAggregate {
    if (!formId?.trim()) throw new Error('formId is required');
    if (!emailHash?.trim()) throw new Error('emailHash is required');

    return new ResponseEmailAggregate({
      id: ResponseEmailId.create(),
      formId,
      emailHash,
      respondedAt: new Date(),
    });
  }

  static reconstitute(props: ResponseEmailProps): ResponseEmailAggregate {
    return new ResponseEmailAggregate(props);
  }

  get id(): ResponseEmailId {
    return this.props.id;
  }

  get formId(): string {
    return this.props.formId;
  }

  get emailHash(): string {
    return this.props.emailHash;
  }

  get respondedAt(): Date {
    return this.props.respondedAt;
  }
}
