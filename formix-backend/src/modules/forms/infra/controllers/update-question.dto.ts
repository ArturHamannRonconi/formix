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

export class UpdateQuestionValidationDto {
  @ApiPropertyOptional({ description: 'Minimum value' })
  @IsOptional()
  @IsNumber()
  min?: number;

  @ApiPropertyOptional({ description: 'Maximum value' })
  @IsOptional()
  @IsNumber()
  max?: number;

  @ApiPropertyOptional({ description: 'Regex pattern for validation' })
  @IsOptional()
  @IsString()
  pattern?: string;
}

export class UpdateQuestionDto {
  @ApiPropertyOptional({ description: 'Question label / text' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ description: 'Optional description or hint' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the question is required' })
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiPropertyOptional({ type: [String], description: 'Options for radio, checkbox, or dropdown types' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiPropertyOptional({ type: UpdateQuestionValidationDto, description: 'Validation constraints' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateQuestionValidationDto)
  validation?: UpdateQuestionValidationDto;
}
