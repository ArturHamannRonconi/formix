import { ResendInvitationUseCase } from './resend-invitation.usecase';
import { IInvitationRepository } from '../repositories/invitation.repository';
import { IEmailService } from '@shared/email/email-service.interface';
import { Invitation } from '../aggregate/invitation.aggregate';
import { Output } from '@shared/output';

describe('ResendInvitationUseCase', () => {
  let usecase: ResendInvitationUseCase;
  let invitationRepo: jest.Mocked<IInvitationRepository>;
  let emailService: jest.Mocked<IEmailService>;

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
    emailService = { send: jest.fn().mockResolvedValue(undefined) };

    usecase = new ResendInvitationUseCase(invitationRepo, emailService, 604800000, 'http://localhost:3000');
  });

  it('should resend invitation and generate new token', async () => {
    const inv = makePendingInvitation();
    const originalHash = inv.tokenHash;
    invitationRepo.findById.mockResolvedValue(Output.ok(inv));

    const output = await usecase.execute({
      organizationId: 'org-id',
      invitationId: inv.id.getValue(),
      requestingRole: 'admin',
    });

    expect(output.isFailure).toBe(false);
    expect(output.value.resent).toBe(true);
    expect(invitationRepo.save).toHaveBeenCalled();
    expect(emailService.send).toHaveBeenCalled();
  });

  it('should fail if requester is not admin', async () => {
    const output = await usecase.execute({
      organizationId: 'org-id',
      invitationId: 'any-id',
      requestingRole: 'member',
    });

    expect(output.isFailure).toBe(true);
    expect(output.errorMessage).toBe('Only admins can resend invitations');
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
