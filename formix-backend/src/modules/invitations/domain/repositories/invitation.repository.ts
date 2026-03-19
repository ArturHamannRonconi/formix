import { Invitation } from '../aggregate/invitation.aggregate';
import { InvitationId } from '../aggregate/value-objects/invitation-id.vo';
import { Output } from '@shared/output';

export interface IInvitationRepository {
  save(invitation: Invitation): Promise<void>;
  findById(id: InvitationId): Promise<Output<Invitation>>;
  findByTokenHash(tokenHash: string): Promise<Output<Invitation>>;
  findByOrganizationId(organizationId: string): Promise<Invitation[]>;
  findPendingByEmailAndOrg(email: string, organizationId: string): Promise<Invitation | null>;
  delete(id: InvitationId): Promise<void>;
}

export const INVITATION_REPOSITORY = Symbol('INVITATION_REPOSITORY');
