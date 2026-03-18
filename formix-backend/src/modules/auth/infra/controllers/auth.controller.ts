import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SignupUseCase } from '@modules/auth/domain/usecases/signup.usecase';
import { ConfirmEmailUseCase } from '@modules/auth/domain/usecases/confirm-email.usecase';
import { ResendConfirmationUseCase } from '@modules/auth/domain/usecases/resend-confirmation.usecase';
import { LoginUseCase } from '@modules/auth/domain/usecases/login.usecase';
import { RefreshTokenUseCase } from '@modules/auth/domain/usecases/refresh-token.usecase';
import { LogoutUseCase } from '@modules/auth/domain/usecases/logout.usecase';
import { ForgotPasswordUseCase } from '@modules/auth/domain/usecases/forgot-password.usecase';
import { ResetPasswordUseCase } from '@modules/auth/domain/usecases/reset-password.usecase';
import { Public } from '../decorators/public.decorator';
import { CurrentUser, JwtPayload } from '../decorators/current-user.decorator';
import { SignupDto } from './signup.dto';
import { SignupResponseDto } from './signup-response.dto';
import { ConfirmEmailDto } from './confirm-email.dto';
import { ResendConfirmationDto } from './resend-confirmation.dto';
import { LoginDto } from './login.dto';
import { LoginResponseDto } from './login-response.dto';
import { RefreshTokenDto } from './refresh-token.dto';
import { LogoutDto } from './logout.dto';
import { ForgotPasswordDto } from './forgot-password.dto';
import { ResetPasswordDto } from './reset-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly signupUseCase: SignupUseCase,
    private readonly confirmEmailUseCase: ConfirmEmailUseCase,
    private readonly resendConfirmationUseCase: ResendConfirmationUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  @Post('signup')
  @Public()
  @ApiOperation({ summary: 'Register a new user and organization' })
  @ApiBody({ type: SignupDto })
  @ApiResponse({ status: 201, description: 'User created successfully', type: SignupResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async signup(@Body() dto: SignupDto): Promise<SignupResponseDto> {
    const output = await this.signupUseCase.execute(dto);

    if (output.isFailure) {
      if (output.errorMessage === 'Email already in use') {
        throw new ConflictException(output.errorMessage);
      }
      throw new BadRequestException(output.errorMessage);
    }

    return output.value;
  }

  @Post('confirm-email')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Confirm user email with token' })
  @ApiBody({ type: ConfirmEmailDto })
  @ApiResponse({ status: 200, description: 'Email confirmed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async confirmEmail(@Body() dto: ConfirmEmailDto): Promise<{ success: true }> {
    const output = await this.confirmEmailUseCase.execute(dto);

    if (output.isFailure) {
      throw new BadRequestException(output.errorMessage);
    }

    return output.value;
  }

  @Post('resend-confirmation')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Resend email confirmation link' })
  @ApiBody({ type: ResendConfirmationDto })
  @ApiResponse({ status: 200, description: 'Confirmation email sent if account exists and is unconfirmed' })
  async resendConfirmation(@Body() dto: ResendConfirmationDto): Promise<{ success: true }> {
    const output = await this.resendConfirmationUseCase.execute(dto);
    return output.value;
  }

  @Post('login')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful', type: LoginResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid credentials or email not confirmed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    const output = await this.loginUseCase.execute(dto);

    if (output.isFailure) {
      if (output.errorMessage === 'Invalid credentials') {
        throw new UnauthorizedException(output.errorMessage);
      }
      throw new BadRequestException(output.errorMessage);
    }

    return output.value;
  }

  @Post('refresh')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(@Body() dto: RefreshTokenDto): Promise<LoginResponseDto> {
    const output = await this.refreshTokenUseCase.execute(dto);

    if (output.isFailure) {
      throw new UnauthorizedException(output.errorMessage);
    }

    return output.value;
  }

  @Post('logout')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and invalidate refresh tokens' })
  @ApiBody({ type: LogoutDto })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(
    @Body() dto: LogoutDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ success: true }> {
    const output = await this.logoutUseCase.execute({
      userId: user.userId,
      refreshToken: dto.refreshToken,
    });

    if (output.isFailure) {
      throw new BadRequestException(output.errorMessage);
    }

    return output.value;
  }

  @Post('forgot-password')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset email sent if account exists' })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ success: true }> {
    const output = await this.forgotPasswordUseCase.execute(dto);
    return output.value;
  }

  @Post('reset-password')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Reset password using reset token' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<{ success: true }> {
    const output = await this.resetPasswordUseCase.execute(dto);

    if (output.isFailure) {
      throw new BadRequestException(output.errorMessage);
    }

    return output.value;
  }
}
