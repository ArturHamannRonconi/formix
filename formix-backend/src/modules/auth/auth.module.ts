import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '@modules/users/users.module';
import { OrganizationsModule } from '@modules/organizations/organizations.module';
import { EmailModule } from '@shared/email/email.module';
import { AuthController } from './infra/controllers/auth.controller';
import {
  SignupUseCase,
  JWT_SIGN_FUNCTION,
  EMAIL_CONFIRMATION_EXPIRES_IN_MS,
  APP_URL,
} from './domain/usecases/signup.usecase';
import { ConfirmEmailUseCase } from './domain/usecases/confirm-email.usecase';
import { ResendConfirmationUseCase, RESEND_EMAIL_CONFIRMATION_EXPIRES_IN_MS, RESEND_APP_URL } from './domain/usecases/resend-confirmation.usecase';
import { LoginUseCase, LOGIN_JWT_SIGN_FUNCTION, REFRESH_TOKEN_EXPIRES_IN_MS } from './domain/usecases/login.usecase';
import { RefreshTokenUseCase, REFRESH_JWT_SIGN_FUNCTION, REFRESH_TOKEN_REFRESH_EXPIRES_IN_MS, REFRESH_JWT_REFRESH_SIGN_FUNCTION } from './domain/usecases/refresh-token.usecase';
import { LogoutUseCase } from './domain/usecases/logout.usecase';
import { ForgotPasswordUseCase, FORGOT_PASSWORD_EXPIRES_IN_MS, FORGOT_PASSWORD_APP_URL } from './domain/usecases/forgot-password.usecase';
import { ResetPasswordUseCase } from './domain/usecases/reset-password.usecase';
import { JwtStrategy } from './infra/strategies/jwt.strategy';
import { JwtAuthGuard } from './infra/guards/jwt-auth.guard';

@Module({
  imports: [
    UsersModule,
    OrganizationsModule,
    EmailModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
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
    ConfirmEmailUseCase,
    ResendConfirmationUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    JwtStrategy,
    JwtAuthGuard,
    {
      provide: JWT_SIGN_FUNCTION,
      useFactory: (jwtService: JwtService) => jwtService.sign.bind(jwtService),
      inject: [JwtService],
    },
    {
      provide: LOGIN_JWT_SIGN_FUNCTION,
      useFactory: (jwtService: JwtService) => jwtService.sign.bind(jwtService),
      inject: [JwtService],
    },
    {
      provide: REFRESH_JWT_SIGN_FUNCTION,
      useFactory: (jwtService: JwtService) => jwtService.sign.bind(jwtService),
      inject: [JwtService],
    },
    {
      provide: REFRESH_JWT_REFRESH_SIGN_FUNCTION,
      useFactory: (jwtService: JwtService, config: ConfigService) => {
        return (payload: Record<string, unknown>) =>
          jwtService.sign(payload, {
            secret: config.get<string>('JWT_REFRESH_SECRET', 'refresh-secret'),
            expiresIn: config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d') as `${number}${'s' | 'm' | 'h' | 'd' | 'w' | 'y'}`,
          });
      },
      inject: [JwtService, ConfigService],
    },
    {
      provide: EMAIL_CONFIRMATION_EXPIRES_IN_MS,
      useFactory: (config: ConfigService) =>
        config.get<number>('EMAIL_CONFIRMATION_EXPIRES_IN', 86400000),
      inject: [ConfigService],
    },
    {
      provide: RESEND_EMAIL_CONFIRMATION_EXPIRES_IN_MS,
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
    {
      provide: RESEND_APP_URL,
      useFactory: (config: ConfigService) =>
        config.get<string>('APP_URL', 'http://localhost:3000'),
      inject: [ConfigService],
    },
    {
      provide: REFRESH_TOKEN_EXPIRES_IN_MS,
      useFactory: (config: ConfigService) => {
        const expiresIn = config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
        const match = expiresIn.match(/^(\d+)([smhdwy])$/);
        if (!match) return 604800000;
        const [, num, unit] = match;
        const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000, w: 604800000, y: 31536000000 };
        return parseInt(num) * (multipliers[unit] ?? 604800000);
      },
      inject: [ConfigService],
    },
    {
      provide: REFRESH_TOKEN_REFRESH_EXPIRES_IN_MS,
      useFactory: (config: ConfigService) => {
        const expiresIn = config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
        const match = expiresIn.match(/^(\d+)([smhdwy])$/);
        if (!match) return 604800000;
        const [, num, unit] = match;
        const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000, w: 604800000, y: 31536000000 };
        return parseInt(num) * (multipliers[unit] ?? 604800000);
      },
      inject: [ConfigService],
    },
    {
      provide: FORGOT_PASSWORD_EXPIRES_IN_MS,
      useFactory: (config: ConfigService) =>
        config.get<number>('PASSWORD_RESET_EXPIRES_IN', 3600000),
      inject: [ConfigService],
    },
    {
      provide: FORGOT_PASSWORD_APP_URL,
      useFactory: (config: ConfigService) =>
        config.get<string>('APP_URL', 'http://localhost:3000'),
      inject: [ConfigService],
    },
  ],
  exports: [JwtAuthGuard, JwtStrategy],
})
export class AuthModule {}
