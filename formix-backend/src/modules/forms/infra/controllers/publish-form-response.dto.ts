import { ApiProperty } from '@nestjs/swagger';

export class PublishFormResponseDto {
  @ApiProperty()
  publicToken: string;

  @ApiProperty()
  publicUrl: string;
}
