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
import { MailService } from './api/mail/mail.service';

const ENV = process.env.NODE_ENV?.trim();
const MAIL_PORT = Number(process.env.MAIL_PORT?.trim() || 465);
const MAIL_USER = process.env.MAIL_USER?.trim();

@Module({
  imports: [
    InfraModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ENV ? [`.env.${ENV}`, '.env'] : '.env',
      load: [appConfig],
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: 465,
        secure: true,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
      defaults: {
        from:
          process.env.MAIL_FROM?.trim() ||
          (MAIL_USER ? `Wave Engineering <${MAIL_USER}>` : undefined),
      },
    }),
    ApiModule,
  ],
  controllers: [AppController],
  providers: [AppService, ServicesService, MailService],
})
export class AppModule {}
