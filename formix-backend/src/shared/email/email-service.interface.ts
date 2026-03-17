export enum EmailTemplate {
  EMAIL_CONFIRMATION = 'EMAIL_CONFIRMATION',
  INVITATION = 'INVITATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
}

export interface IEmailService {
  send(to: string, template: EmailTemplate, data: Record<string, unknown>): Promise<void>;
}

export const EMAIL_SERVICE = Symbol('EMAIL_SERVICE');
