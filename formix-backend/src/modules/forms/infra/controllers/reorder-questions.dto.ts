import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ReorderItemDto {
  @ApiProperty({ description: 'Question ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'New order position (0-based)' })
  @IsNumber()
  order: number;
}

export class ReorderQuestionsDto {
  @ApiProperty({ type: [ReorderItemDto], description: 'Array of questions with their new order positions' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  questions: ReorderItemDto[];
}
