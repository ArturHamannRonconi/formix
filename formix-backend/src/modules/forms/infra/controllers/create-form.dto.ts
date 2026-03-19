import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateFormDto {
  @ApiProperty({ example: 'Pesquisa de satisfação', description: 'Título do formulário' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Formulário de feedback', description: 'Descrição do formulário' })
  @IsOptional()
  @IsString()
  description?: string;
}
