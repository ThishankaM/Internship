import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsHexColor,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'TaskFlow Website' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Main product development' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '#8A73FF' })
  @IsString()
  @IsOptional()
  // allow hex or any string, validate loosely
  color?: string;

  @ApiPropertyOptional({ example: 'briefcase' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ enum: ['active', 'completed', 'archived'], default: 'active' })
  @IsString()
  @IsOptional()
  @IsIn(['active', 'completed', 'archived'])
  status?: 'active' | 'completed' | 'archived';

  @ApiPropertyOptional({ example: '2026-10-01' })
  @IsString()
  @IsOptional()
  dueDate?: string;
}
