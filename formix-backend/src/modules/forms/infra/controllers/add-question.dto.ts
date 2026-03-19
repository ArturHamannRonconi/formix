import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

const QUESTION_TYPES = [
  'text',
  'textarea',
  'checkbox',
  'radio',
  'toggle',
  'dropdown',
  'number',
  'date',
  'rating',
  'file',
  'email',
];

export class QuestionValidationDto {
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

export class AddQuestionDto {
  @ApiProperty({
    enum: QUESTION_TYPES,
    description: 'Question type',
  })
  @IsIn(QUESTION_TYPES)
  type: string;

  @ApiProperty({ description: 'Question label / text' })
  @IsString()
  label: string;

  @ApiPropertyOptional({ description: 'Optional description or hint' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ default: false, description: 'Whether the question is required' })
  @IsBoolean()
  required: boolean;

  @ApiPropertyOptional({ type: [String], description: 'Options for radio, checkbox, or dropdown types' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiPropertyOptional({ type: QuestionValidationDto, description: 'Validation constraints' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => QuestionValidationDto)
  validation?: QuestionValidationDto;
}
