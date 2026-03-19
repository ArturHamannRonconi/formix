import { CancelInvitationUseCase } from './cancel-invitation.usecase';
import { IInvitationRepository } from '../repositories/invitation.repository';
import { Invitation } from '../aggregate/invitation.aggregate';
import { Output } from '@shared/output';

describe('CancelInvitationUseCase', () => {
  let usecase: CancelInvitationUseCase;
  let invitationRepo: jest.Mocked<IInvitationRepository>;

  const makePendingInvitation = (orgId = 'org-id') =>
    Invitation.create({ organizationId: orgId, email: 'user@example.com', expiresInMs: 604800000 });

  beforeEach(() => {
    invitationRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByTokenHash: jest.fn(),
      findByOrganizationId: jest.fn(),
      findPendingByEmailAndOrg: jest.fn(),
      delete: jest.fn(),
    };

    usecase = new CancelInvitationUseCase(invitationRepo);
  });

  it('should cancel a pending invitation', async () => {
    const inv = makePendingInvitation();
    invitationRepo.findById.mockResolvedValue(Output.ok(inv));

    const output = await usecase.execute({
      organizationId: 'org-id',
      invitationId: inv.id.getValue(),
      requestingRole: 'admin',
    });

    expect(output.isFailure).toBe(false);
    expect(output.value.cancelled).toBe(true);
    expect(invitationRepo.save).toHaveBeenCalled();
  });

  it('should fail if requester is not admin', async () => {
    const output = await usecase.execute({
      organizationId: 'org-id',
      invitationId: 'any-id',
      requestingRole: 'member',
    });

    expect(output.isFailure).toBe(true);
    expect(output.errorMessage).toBe('Only admins can cancel invitations');
  });

  it('should fail if invitation does not exist', async () => {
    invitationRepo.findById.mockResolvedValue(Output.fail('Invitation not found'));

    const output = await usecase.execute({
      organizationId: 'org-id',
      invitationId: 'nonexistent',
      requestingRole: 'admin',
    });

    expect(output.isFailure).toBe(true);
    expect(output.errorMessage).toBe('Invitation not found');
  });

  it('should fail if invitation is not pending', async () => {
    const inv = makePendingInvitation();
    inv.accept();
    invitationRepo.findById.mockResolvedValue(Output.ok(inv));

    const output = await usecase.execute({
      organizationId: 'org-id',
      invitationId: inv.id.getValue(),
      requestingRole: 'admin',
    });

    expect(output.isFailure).toBe(true);
    expect(output.errorMessage).toBe('Invitation is not pending');
  });

  it('should fail if invitation belongs to another organization', async () => {
    const inv = makePendingInvitation('other-org');
    invitationRepo.findById.mockResolvedValue(Output.ok(inv));

    const output = await usecase.execute({
      organizationId: 'org-id',
      invitationId: inv.id.getValue(),
      requestingRole: 'admin',
    });

    expect(output.isFailure).toBe(true);
    expect(output.errorMessage).toBe('Invitation not found');
  });
});
