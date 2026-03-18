import { Organization } from '../aggregate/organization.aggregate';
import { OrganizationId } from '../aggregate/value-objects/organization-id.vo';
import { UserId } from '@modules/users/domain/aggregate/value-objects/user-id.vo';
import { Slug } from '../aggregate/value-objects/slug.vo';
import { Output } from '@shared/output';

export interface IOrganizationRepository {
  save(org: Organization): Promise<void>;
  findById(id: OrganizationId): Promise<Output<Organization>>;
  findBySlug(slug: Slug): Promise<Output<Organization>>;
  findByMemberId(userId: UserId): Promise<Organization[]>;
  existsBySlug(slug: Slug): Promise<boolean>;
}

export const ORGANIZATION_REPOSITORY = Symbol('ORGANIZATION_REPOSITORY');
