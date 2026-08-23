import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InfraModule } from './infra/infra/infra.module';

import { PrismaModule } from './infra/infra/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

import appConfig from './config/app.config';
import { ApiModule } from './api/api.module';
import { ServicesService } from './api/services/services.service';
import { MailerModule } from '@nestjs-modules/mailer';
import type { ConfigType } from '@nestjs/config';
import { buildMailerOptions } from './config/mail-transport.config';
import { APP_GUARD } from '@nestjs/core';
import { RequestOriginGuard } from './common/guards/request-origin.guard';
import { ThrottlerModule } from '@nestjs/throttler';

const ENV = process.env.NODE_ENV?.trim();
const SECONDS_TO_MILLISECONDS = 1000;

@Module({
  imports: [
    InfraModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ENV ? [`.env.${ENV}`, '.env'] : '.env',
      load: [appConfig],
    }),
    MailerModule.forRootAsync({
      inject: [appConfig.KEY],
      useFactory: (appConfiguration: ConfigType<typeof appConfig>) =>
        buildMailerOptions({
          smtp: appConfiguration.mail.smtp,
          from: appConfiguration.mail.from,
        }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60 * SECONDS_TO_MILLISECONDS,
        limit: 100,
      },
    ]),
    ApiModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ServicesService,
    {
      provide: APP_GUARD,
      useClass: RequestOriginGuard,
    },
  ],
})
export class AppModule {}
