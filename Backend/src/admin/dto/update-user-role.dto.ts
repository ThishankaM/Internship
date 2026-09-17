import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRoleDto {
  @ApiProperty({ enum: ['USER', 'ADMIN'] })
  @IsIn(['USER', 'ADMIN'])
  role: 'USER' | 'ADMIN';
}
