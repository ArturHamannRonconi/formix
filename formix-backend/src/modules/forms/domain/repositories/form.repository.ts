import { FormAggregate } from '../aggregate/form.aggregate';
import { FormId } from '../aggregate/value-objects/form-id.vo';
import { Output } from '@shared/output';

export interface IFormRepository {
  save(form: FormAggregate): Promise<void>;
  findById(id: FormId): Promise<Output<FormAggregate>>;
  findByOrganizationId(organizationId: string, status?: string): Promise<FormAggregate[]>;
  findByPublicToken(publicToken: string): Promise<Output<FormAggregate>>;
  delete(id: FormId): Promise<void>;
}

export const FORM_REPOSITORY = Symbol('FORM_REPOSITORY');
