import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailTemplate, IEmailService } from '@providers/email/email.provider';
import { EMAIL_HTML_TEMPLATES } from '@providers/email/email-templates';

@Injectable()
export class EtherealEmailService implements IEmailService {
  private readonly logger = new Logger(EtherealEmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {}

  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (!this.transporter) {
      const testAccount = await nodemailer.createTestAccount();
      this.logger.log(`Ethereal test account: ${testAccount.user} / ${testAccount.pass}`);
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }
    return this.transporter;
  }

  async send(to: string, template: EmailTemplate, data: Record<string, unknown>): Promise<void> {
    const { subject, buildHtml, buildText } = EMAIL_HTML_TEMPLATES[template];
    const transporter = await this.getTransporter();

    const info = await transporter.sendMail({
      from: this.config.get<string>('EMAIL_FROM', 'noreply@formix.app'),
      to,
      subject,
      text: buildText(data),
      html: buildHtml(data),
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    this.logger.log(`Email enviado para ${to} | Template: ${template}`);
    this.logger.log(`Preview URL: ${previewUrl}`);
  }
}
