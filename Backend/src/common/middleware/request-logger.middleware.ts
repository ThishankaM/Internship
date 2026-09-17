import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { JsonLoggerService } from '../logging/json-logger.service.js';

type RequestWithId = Request & { requestId?: string };

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: JsonLoggerService) {}

  use(request: RequestWithId, response: Response, next: NextFunction): void {
    const startedAt = Date.now();
    const requestId =
      (request.headers['x-request-id'] as string | undefined) ?? randomUUID();

    request.requestId = requestId;
    response.setHeader('x-request-id', requestId);

    response.on('finish', () => {
      this.logger.log(
        {
          requestId,
          method: request.method,
          path: request.originalUrl,
          statusCode: response.statusCode,
          durationMs: Date.now() - startedAt,
        },
        'HTTP',
      );
    });

    next();
  }
}
