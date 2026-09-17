import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TodosModule } from './todos/todos.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { TagsModule } from './tags/tags.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AdminController } from './admin/admin.controller.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

const observeAppKey = process.env.OBSERVE_APP_KEY;
const observeAppSecret = process.env.OBSERVE_APP_SECRET;
export const isObserveEnabled = Boolean(observeAppKey && observeAppSecret);

@Module({
  imports: [
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
  providers: [AppService],
})
export class AppModule {}
