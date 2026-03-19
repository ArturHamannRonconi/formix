import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResponsesOverTimeDto {
  @ApiProperty({ example: '2024-01-15', description: 'Date string (day/week/month)' })
  date: string;

  @ApiProperty({ example: 5 })
  count: number;
}

export class RadioDistributionItemDto {
  @ApiProperty({ example: 'Option A' })
  option: string;

  @ApiProperty({ example: 10 })
  count: number;

  @ApiProperty({ example: 66.7 })
  percentage: number;
}

export class CheckboxOptionCountDto {
  @ApiProperty({ example: 'Option X' })
  option: string;

  @ApiProperty({ example: 8 })
  count: number;
}

export class CheckboxCombinationDto {
  @ApiProperty({ example: ['Option X', 'Option Y'], type: [String] })
  combination: string[];

  @ApiProperty({ example: 3 })
  count: number;
}

export class HistogramItemDto {
  @ApiProperty({ example: '10-20' })
  range: string;

  @ApiProperty({ example: 4 })
  count: number;
}

export class RatingDistributionItemDto {
  @ApiProperty({ example: 5 })
  rating: number;

  @ApiProperty({ example: 12 })
  count: number;
}

export class DateDistributionItemDto {
  @ApiProperty({ example: '2024-03-01' })
  date: string;

  @ApiProperty({ example: 3 })
  count: number;
}

export class AnalyticsResponseDto {
  @ApiProperty({ example: 'form-id-123' })
  formId: string;

  @ApiProperty({ example: 42 })
  totalResponses: number;

  @ApiProperty({ type: [ResponsesOverTimeDto] })
  responsesOverTime: ResponsesOverTimeDto[];

  @ApiProperty({ description: 'Per-question metrics — shape varies by question type', type: [Object] })
  questionMetrics: object[];
}
