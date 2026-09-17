import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Validation failed' })
  message: string | string[];

  @ApiProperty({ example: 'Bad Request' })
  error: string;

  @ApiProperty({ example: '/api/v1/todos' })
  path: string;

  @ApiProperty({ example: '2026-09-17T10:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: 'd95f6fbd-5e7b-4e6c-9f8f-3f8f4f8f4f8f' })
  requestId: string;
}
