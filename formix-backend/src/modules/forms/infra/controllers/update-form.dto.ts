import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateFormSettingsDto {
  @ApiPropertyOptional({ description: 'ISO date string for expiration', example: '2025-12-31T23:59:59Z' })
  @IsOptional()
  @IsString()
  expiresAt?: string;

  @ApiPropertyOptional({ description: 'Maximum number of responses', example: 100 })
  @IsOptional()
  @IsNumber()
  maxResponses?: number;

  @ApiPropertyOptional({ description: 'Whether multiple responses are allowed', example: false })
  @IsOptional()
  @IsBoolean()
  allowMultipleResponses?: boolean;

  @ApiPropertyOptional({ description: 'List of allowed email domains', example: ['example.com'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedEmailDomains?: string[];
}

export class UpdateFormDto {
  @ApiPropertyOptional({ example: 'Updated title', description: 'New title for the form' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description', description: 'New description for the form' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Form settings', type: UpdateFormSettingsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateFormSettingsDto)
  settings?: UpdateFormSettingsDto;
}
