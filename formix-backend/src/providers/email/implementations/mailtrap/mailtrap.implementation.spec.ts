import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { MailtrapEmailService } from './mailtrap.implementation';
import { EmailTemplate } from '@providers/email/email.provider';

jest.mock('nodemailer');

const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' });

(nodemailer.createTransport as jest.Mock).mockReturnValue({
  sendMail: mockSendMail,
});

const makeConfig = (overrides: Record<string, unknown> = {}): ConfigService => {
  const values: Record<string, unknown> = {
    SMTP_HOST: 'sandbox.smtp.mailtrap.io',
    SMTP_PORT: 2525,
    SMTP_USER: 'test-user',
    SMTP_PASS: 'test-pass',
    EMAIL_FROM: 'noreply@formix.app',
    ...overrides,
  };
  return { get: (key: string, fallback?: unknown) => values[key] ?? fallback } as unknown as ConfigService;
};

describe('MailtrapEmailService', () => {
  let service: MailtrapEmailService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MailtrapEmailService(makeConfig());
  });

  it('should create transporter with SMTP config from env', () => {
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      auth: { user: 'test-user', pass: 'test-pass' },
    });
  });

  it('should send EMAIL_CONFIRMATION with correct subject and text', async () => {
    await service.send('user@example.com', EmailTemplate.EMAIL_CONFIRMATION, {
      confirmationUrl: 'https://app.formix.com/confirm/abc123',
    });

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        from: 'noreply@formix.app',
        subject: 'Confirme seu e-mail',
        text: 'Acesse o link para confirmar seu e-mail: https://app.formix.com/confirm/abc123',
      }),
    );
  });

  it('should send INVITATION with correct subject and text', async () => {
    await service.send('invited@example.com', EmailTemplate.INVITATION, {
      inviteUrl: 'https://app.formix.com/invite/xyz',
    });

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'invited@example.com',
        subject: 'Você foi convidado',
        text: 'Acesse o link para aceitar o convite: https://app.formix.com/invite/xyz',
      }),
    );
  });

  it('should send PASSWORD_RESET with correct subject and text', async () => {
    await service.send('user@example.com', EmailTemplate.PASSWORD_RESET, {
      resetUrl: 'https://app.formix.com/reset/token123',
    });

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: 'Redefinição de senha',
        text: 'Acesse o link para redefinir sua senha: https://app.formix.com/reset/token123',
      }),
    );
  });

  it('should use EMAIL_FROM from config', async () => {
    service = new MailtrapEmailService(makeConfig({ EMAIL_FROM: 'custom@myapp.com' }));

    await service.send('user@example.com', EmailTemplate.INVITATION, { inviteUrl: 'https://x.com' });

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({ from: 'custom@myapp.com' }),
    );
  });

  it('should resolve when sendMail succeeds', async () => {
    await expect(
      service.send('user@example.com', EmailTemplate.EMAIL_CONFIRMATION, {
        confirmationUrl: 'https://x.com',
      }),
    ).resolves.toBeUndefined();
  });

  it('should propagate error when sendMail fails', async () => {
    mockSendMail.mockRejectedValueOnce(new Error('SMTP connection refused'));

    await expect(
      service.send('user@example.com', EmailTemplate.EMAIL_CONFIRMATION, {
        confirmationUrl: 'https://x.com',
      }),
    ).rejects.toThrow('SMTP connection refused');
  });
});
