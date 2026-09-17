import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule, ObserveInstrument, isObserveEnabled } from './app.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { JsonLoggerService } from './common/logging/json-logger.service.js';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware.js';

async function bootstrap() {
  const app = isObserveEnabled
    ? await NestFactory.create(AppModule, {
        instrument: ObserveInstrument,
      })
    : await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const logger = app.get(JsonLoggerService);

  app.useLogger(logger);
  app.use(helmet());
  const requestLogger = new RequestLoggerMiddleware(logger);
  app.use(requestLogger.use.bind(requestLogger));

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.enableCors({
    origin: configService.get<string[]>('corsOrigins'),
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter(logger));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('TaskFlow API')
    .setDescription(
      'TaskFlow authentication, todo, category, tag, and admin APIs.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: true,
  });

  await app.listen(configService.get<number>('port', 3000));
}

await bootstrap();
