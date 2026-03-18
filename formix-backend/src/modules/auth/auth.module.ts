import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersModule } from '@modules/users/users.module';
import { OrganizationsModule } from '@modules/organizations/organizations.module';
import { AuthController } from './infra/controllers/auth.controller';
import {
  SignupUseCase,
  JWT_SIGN_FUNCTION,
  EMAIL_CONFIRMATION_EXPIRES_IN_MS,
  APP_URL,
} from './domain/usecases/signup.usecase';

@Module({
  imports: [
    UsersModule,
    OrganizationsModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m') as `${number}${'s' | 'm' | 'h' | 'd' | 'w' | 'y'}`,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    SignupUseCase,
    {
      provide: JWT_SIGN_FUNCTION,
      useFactory: (jwtService: JwtService) => jwtService.sign.bind(jwtService),
      inject: [JwtService],
    },
    {
      provide: EMAIL_CONFIRMATION_EXPIRES_IN_MS,
      useFactory: (config: ConfigService) =>
        config.get<number>('EMAIL_CONFIRMATION_EXPIRES_IN', 86400000),
      inject: [ConfigService],
    },
    {
      provide: APP_URL,
      useFactory: (config: ConfigService) =>
        config.get<string>('APP_URL', 'http://localhost:3000'),
      inject: [ConfigService],
    },
  ],
})
export class AuthModule {}
