import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InfraModule } from './infra/infra/infra.module';

import { PrismaModule } from './infra/infra/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

import appConfig from './config/app.config';
import { ApiModule } from './api/api.module';
import { ServicesService } from './api/services/services.service';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    InfraModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
      load: [appConfig],
    }),
    ApiModule,
  ],
  controllers: [AppController],
  providers: [AppService, ServicesService],
})
export class AppModule {}
