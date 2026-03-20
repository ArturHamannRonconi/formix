import { ResponseAggregate } from '../aggregate/response.aggregate';
import { Output } from '@shared/output';

export interface FindByFormIdOptions {
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface IResponseRepository {
  save(response: ResponseAggregate): Promise<void>;
  findByFormId(formId: string, options?: FindByFormIdOptions): Promise<ResponseAggregate[]>;
  findAllByFormId(formId: string): Promise<ResponseAggregate[]>;
  countByFormId(formId: string, search?: string): Promise<number>;
  deleteByFormId(formId: string): Promise<void>;
}

export const RESPONSE_REPOSITORY = Symbol('RESPONSE_REPOSITORY');
