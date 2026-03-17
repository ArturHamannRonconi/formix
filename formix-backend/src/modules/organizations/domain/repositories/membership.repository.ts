import { Membership } from '../aggregate/entities/membership.entity';

export interface IMembershipRepository {
  findByUserAndOrg(userId: string, organizationId: string): Promise<Membership | null>;
  findByOrganizationId(organizationId: string): Promise<Membership[]>;
  findByUserId(userId: string): Promise<Membership[]>;
  save(membership: Membership): Promise<void>;
  delete(id: string): Promise<void>;
  countAdminsByOrganization(organizationId: string): Promise<number>;
}

export const MEMBERSHIP_REPOSITORY = Symbol('MEMBERSHIP_REPOSITORY');
