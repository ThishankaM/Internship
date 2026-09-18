import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProjectEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description: string | null;

  @ApiPropertyOptional()
  color: string | null;

  @ApiPropertyOptional()
  icon: string | null;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  dueDate: string | null;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
