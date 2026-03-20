import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailTemplate, IEmailService } from '@providers/email/email.provider';
import { EMAIL_HTML_TEMPLATES } from '@providers/email/email-templates';

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
    const { subject, buildHtml, buildText } = EMAIL_HTML_TEMPLATES[template];

    await this.transporter.sendMail({
      from: this.config.get<string>('EMAIL_FROM', 'noreply@formix.app'),
      to,
      subject,
      text: buildText(data),
      html: buildHtml(data),
    });
  }
}
