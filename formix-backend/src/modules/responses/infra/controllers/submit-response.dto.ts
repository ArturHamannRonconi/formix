import { ApiProperty } from '@nestjs/swagger';
import { Allow, IsArray, IsEmail, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerDto {
  @ApiProperty({ example: 'uuid-question-id', description: 'Question ID' })
  @IsString()
  questionId: string;

  @ApiProperty({ example: 'My answer', description: 'Answer value (any type depending on question type)' })
  @Allow()
  value: unknown;
}

export class SubmitResponseDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email of the respondent' })
  @IsEmail()
  email: string;

  @ApiProperty({ type: [AnswerDto], description: 'List of answers' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}

export class SubmitResponseResponseDto {
  @ApiProperty({ example: true })
  submitted: boolean;
}
