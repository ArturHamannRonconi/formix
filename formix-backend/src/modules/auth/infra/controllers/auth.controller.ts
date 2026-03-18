import { BadRequestException, Body, ConflictException, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignupUseCase } from '@modules/auth/domain/usecases/signup.usecase';
import { SignupDto } from './signup.dto';
import { SignupResponseDto } from './signup-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly signupUseCase: SignupUseCase) {}

  @Post('signup')
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
}
