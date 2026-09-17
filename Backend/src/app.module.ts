import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TodosModule } from './todos/todos.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { TagsModule } from './tags/tags.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AdminController } from './admin/admin.controller.js';
import configuration, {
  validateEnvironment,
} from './config/configuration.js';
import { JsonLoggerService } from './common/logging/json-logger.service.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

const observeAppKey = process.env.OBSERVE_APP_KEY;
const observeAppSecret = process.env.OBSERVE_APP_SECRET;
export const isObserveEnabled = Boolean(observeAppKey && observeAppSecret);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      validate: validateEnvironment,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>('throttle.ttlMs', 60000),
            limit: configService.get<number>('throttle.limit', 100),
          },
        ],
      }),
    }),
    ...(isObserveEnabled
      ? [
          ObserveModule.forRoot({
            appKey: observeAppKey!,
            appSecret: observeAppSecret!,
            serviceId: 'todo-backend',
          }),
        ]
      : []),
    PrismaModule,
    TodosModule,
    AuthModule,
    CategoriesModule,
    TagsModule,
  ],
  controllers: [AppController, AdminController],
  providers: [
    AppService,
    JsonLoggerService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
