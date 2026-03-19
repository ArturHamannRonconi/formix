import { ConsoleEmailService } from './console.implementation';
import { EmailTemplate } from '@providers/email/email.provider';

describe('ConsoleEmailService', () => {
  let service: ConsoleEmailService;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    service = new ConsoleEmailService();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should resolve without errors', async () => {
    await expect(
      service.send('user@example.com', EmailTemplate.EMAIL_CONFIRMATION, { token: 'abc123' }),
    ).resolves.toBeUndefined();
  });

  it('should log the correct data', async () => {
    const to = 'user@example.com';
    const template = EmailTemplate.INVITATION;
    const data = { inviteUrl: 'https://example.com/invite/xyz' };

    await service.send(to, template, data);

    expect(consoleSpy).toHaveBeenCalledWith(
      '[EmailService]',
      expect.objectContaining({ to, template, data }),
    );
  });

  it('should log all three email templates correctly', async () => {
    await service.send('a@b.com', EmailTemplate.PASSWORD_RESET, { resetUrl: 'https://reset' });

    expect(consoleSpy).toHaveBeenCalledWith(
      '[EmailService]',
      expect.objectContaining({
        to: 'a@b.com',
        template: EmailTemplate.PASSWORD_RESET,
        data: { resetUrl: 'https://reset' },
      }),
    );
  });
});
