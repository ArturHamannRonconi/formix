import { Injectable } from '@nestjs/common';
import { EmailTemplate, IEmailService } from './email-service.interface';

@Injectable()
export class ConsoleEmailService implements IEmailService {
  async send(to: string, template: EmailTemplate, data: Record<string, unknown>): Promise<void> {
    console.log('[EmailService]', { to, template, data });
  }
}
