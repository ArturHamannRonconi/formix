import { ResponseAggregate } from '../aggregate/response.aggregate';
import { Output } from '@shared/output';

export interface FindByFormIdOptions {
  limit?: number;
  offset?: number;
}

export interface IResponseRepository {
  save(response: ResponseAggregate): Promise<void>;
  findByFormId(formId: string, options?: FindByFormIdOptions): Promise<ResponseAggregate[]>;
  countByFormId(formId: string): Promise<number>;
  deleteByFormId(formId: string): Promise<void>;
}

export const RESPONSE_REPOSITORY = Symbol('RESPONSE_REPOSITORY');
