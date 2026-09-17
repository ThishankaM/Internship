import { Injectable, LoggerService } from '@nestjs/common';

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'verbose';

@Injectable()
export class JsonLoggerService implements LoggerService {
  log(message: unknown, context?: string): void {
    this.write('info', message, context);
  }

  error(message: unknown, trace?: string, context?: string): void {
    this.write('error', message, context, trace);
  }

  warn(message: unknown, context?: string): void {
    this.write('warn', message, context);
  }

  debug(message: unknown, context?: string): void {
    this.write('debug', message, context);
  }

  verbose(message: unknown, context?: string): void {
    this.write('verbose', message, context);
  }

  private write(
    level: LogLevel,
    message: unknown,
    context?: string,
    trace?: string,
  ): void {
    const payload = {
      timestamp: new Date().toISOString(),
      level,
      context: context ?? 'Application',
      message: this.normalizeMessage(message),
      ...(trace ? { trace } : {}),
    };

    const line = JSON.stringify(payload);

    if (level === 'error') {
      console.error(line);
      return;
    }

    if (level === 'warn') {
      console.warn(line);
      return;
    }

    console.log(line);
  }

  private normalizeMessage(message: unknown): unknown {
    if (message instanceof Error) {
      return {
        name: message.name,
        message: message.message,
        stack: message.stack,
      };
    }

    return message;
  }
}
