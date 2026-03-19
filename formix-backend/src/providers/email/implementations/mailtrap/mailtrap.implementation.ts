import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailTemplate, IEmailService } from '@providers/email/email.provider';

const TEMPLATES: Record<EmailTemplate, { subject: string; buildText: (data: Record<string, unknown>) => string }> = {
  [EmailTemplate.EMAIL_CONFIRMATION]: {
    subject: 'Confirme seu e-mail',
    buildText: (data) => `Acesse o link para confirmar seu e-mail: ${data.confirmationUrl}`,
  },
  [EmailTemplate.INVITATION]: {
    subject: 'Você foi convidado',
    buildText: (data) => `Acesse o link para aceitar o convite: ${data.inviteUrl}`,
  },
  [EmailTemplate.PASSWORD_RESET]: {
    subject: 'Redefinição de senha',
    buildText: (data) => `Acesse o link para redefinir sua senha: ${data.resetUrl}`,
  },
};

@Injectable()
export class MailtrapEmailService implements IEmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST', 'sandbox.smtp.mailtrap.io'),
      port: this.config.get<number>('SMTP_PORT', 2525),
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
    });
  }

  async send(to: string, template: EmailTemplate, data: Record<string, unknown>): Promise<void> {
    const { subject, buildText } = TEMPLATES[template];

    await this.transporter.sendMail({
      from: this.config.get<string>('EMAIL_FROM', 'noreply@formix.app'),
      to,
      subject,
      text: buildText(data),
    });
  }
}
