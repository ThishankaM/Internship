import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument, isObserveEnabled } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = isObserveEnabled
    ? await NestFactory.create(AppModule, {
        instrument: ObserveInstrument,
      })
    : await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });
  app.useGlobalPipes(
    new ValidationPipe(
      {
        whitelist: true,
        transform: true,
      }
    ));
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
