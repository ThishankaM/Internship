import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({ example: 'backend' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
