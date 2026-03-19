import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FormResponseDto {
  @ApiProperty({ description: 'Form ID' })
  id: string;

  @ApiProperty({ description: 'Organization ID' })
  organizationId: string;

  @ApiProperty({ description: 'User ID who created the form' })
  createdBy: string;

  @ApiProperty({ description: 'Form title' })
  title: string;

  @ApiPropertyOptional({ description: 'Form description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Public token for sharing the form' })
  publicToken?: string;

  @ApiProperty({ description: 'Form status', example: 'draft' })
  status: string;

  @ApiProperty({ description: 'Form settings', example: {} })
  settings: object;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class ListFormsResponseDto {
  @ApiProperty({ description: 'List of forms', type: [FormResponseDto] })
  forms: FormResponseDto[];
}

export class CreateFormResponseDto {
  @ApiProperty({ description: 'ID of the created form' })
  formId: string;
}

export class QuestionResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() formId: string;
  @ApiProperty() organizationId: string;
  @ApiProperty() type: string;
  @ApiProperty() label: string;
  @ApiPropertyOptional() description?: string;
  @ApiProperty() required: boolean;
  @ApiProperty() order: number;
  @ApiPropertyOptional({ type: [String] }) options?: string[];
  @ApiPropertyOptional() validation?: object;
  @ApiProperty() createdAt: Date;
}

export class GetFormResponseDto {
  @ApiProperty({ type: FormResponseDto }) form: FormResponseDto;
  @ApiProperty({ type: [QuestionResponseDto] }) questions: QuestionResponseDto[];
}
