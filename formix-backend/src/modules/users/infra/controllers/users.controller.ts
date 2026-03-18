import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetProfileUseCase } from '@modules/users/domain/usecases/get-profile.usecase';
import { UpdateProfileUseCase } from '@modules/users/domain/usecases/update-profile.usecase';
import { CurrentUser, JwtPayload } from '@modules/auth/infra/decorators/current-user.decorator';
import { GetProfileResponseDto } from './get-profile-response.dto';
import { UpdateProfileDto } from './update-profile.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile returned', type: GetProfileResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getProfile(@CurrentUser() user: JwtPayload): Promise<GetProfileResponseDto> {
    const output = await this.getProfileUseCase.execute({ userId: user.userId });
    if (output.isFailure) throw new NotFoundException(output.errorMessage);
    return output.value;
  }

  @Patch('me')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update current user profile (name and/or password)' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request (e.g., incorrect current password)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ): Promise<{ updated: true }> {
    const output = await this.updateProfileUseCase.execute({
      userId: user.userId,
      ...dto,
    });
    if (output.isFailure) throw new BadRequestException(output.errorMessage);
    return output.value;
  }
}
