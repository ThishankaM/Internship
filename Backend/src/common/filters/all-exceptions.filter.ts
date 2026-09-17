import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { JsonLoggerService } from '../logging/json-logger.service.js';

type RequestWithId = Request & { requestId?: string };

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: JsonLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<RequestWithId>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const isProduction = process.env.NODE_ENV === 'production';
    const message = this.extractMessage(exceptionResponse, status, isProduction);
    const error =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as { error?: string }).error ?? 'Error'
        : 'Error';

    if (status >= 500) {
      this.logger.error(
        exception instanceof Error ? exception : String(exception),
        exception instanceof Error ? exception.stack : undefined,
        'ExceptionFilter',
      );
    } else {
      this.logger.warn(
        {
          statusCode: status,
          message,
          path: request.originalUrl,
        },
        'ExceptionFilter',
      );
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      error,
      path: request.originalUrl,
      timestamp: new Date().toISOString(),
      requestId: request.requestId ?? 'unknown',
    });
  }

  private extractMessage(
    exceptionResponse: string | object | null,
    status: number,
    isProduction: boolean,
  ): string | string[] {
    if (status >= 500 && isProduction) {
      return 'Internal server error';
    }

    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      const message = (exceptionResponse as { message: string | string[] })
        .message;
      if (Array.isArray(message) || typeof message === 'string') {
        return message;
      }
    }

    return status >= 500 ? 'Internal server error' : 'Request failed';
  }
}
