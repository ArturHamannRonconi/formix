import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EMAIL_SERVICE, IEmailService } from '@providers/email/email.provider';
import { ConsoleEmailService } from './implementations/console/console.implementation';
import { MailtrapEmailService } from './implementations/mailtrap/mailtrap.implementation';
import { EtherealEmailService } from './implementations/ethereal/ethereal.implementation';

@Global()
@Module({
  providers: [
    ConsoleEmailService,
    MailtrapEmailService,
    EtherealEmailService,
    {
      provide: EMAIL_SERVICE,
      useFactory: (
        config: ConfigService,
        console: ConsoleEmailService,
        mailtrap: MailtrapEmailService,
        ethereal: EtherealEmailService
      ): IEmailService => {
        const provider = config.get<string>('EMAIL_PROVIDER', 'console');
        if (provider === 'mailtrap') return mailtrap;
        if (provider === 'ethereal') return ethereal;
        return console;
      },
      inject: [ConfigService, ConsoleEmailService, MailtrapEmailService, EtherealEmailService],
    },
  ],
  exports: [EMAIL_SERVICE],
})
export class EmailModule {}
