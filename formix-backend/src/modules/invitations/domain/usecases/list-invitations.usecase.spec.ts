import { ListInvitationsUseCase } from './list-invitations.usecase';
import { IInvitationRepository } from '../repositories/invitation.repository';
import { Invitation } from '../aggregate/invitation.aggregate';

describe('ListInvitationsUseCase', () => {
  let usecase: ListInvitationsUseCase;
  let invitationRepo: jest.Mocked<IInvitationRepository>;

  const makeInvitation = (orgId: string) =>
    Invitation.create({ organizationId: orgId, email: 'user@example.com', expiresInMs: 604800000 });

  beforeEach(() => {
    invitationRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByTokenHash: jest.fn(),
      findByOrganizationId: jest.fn(),
      findPendingByEmailAndOrg: jest.fn(),
      delete: jest.fn(),
    };

    usecase = new ListInvitationsUseCase(invitationRepo);
  });

  it('should return invitations for the organization', async () => {
    const invitations = [makeInvitation('org-1'), makeInvitation('org-1')];
    invitationRepo.findByOrganizationId.mockResolvedValue(invitations);

    const output = await usecase.execute({ organizationId: 'org-1' });

    expect(output.isFailure).toBe(false);
    expect(output.value.invitations).toHaveLength(2);
    expect(output.value.invitations[0]).toHaveProperty('id');
    expect(output.value.invitations[0]).toHaveProperty('email');
    expect(output.value.invitations[0]).toHaveProperty('status');
  });

  it('should not return invitations from other orgs', async () => {
    invitationRepo.findByOrganizationId.mockResolvedValue([makeInvitation('org-2')]);

    const output = await usecase.execute({ organizationId: 'org-1' });

    expect(invitationRepo.findByOrganizationId).toHaveBeenCalledWith('org-1');
  });
});
