import { ResponseEmailAggregate } from '../aggregate/response-email.aggregate';

export interface IResponseEmailRepository {
  save(responseEmail: ResponseEmailAggregate): Promise<void>;
  existsByFormIdAndEmailHash(formId: string, emailHash: string): Promise<boolean>;
  deleteByFormId(formId: string): Promise<void>;
}

export const RESPONSE_EMAIL_REPOSITORY = Symbol('RESPONSE_EMAIL_REPOSITORY');
