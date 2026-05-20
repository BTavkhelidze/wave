import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InfraModule } from './infra/infra/infra.module';
import { ServicesService } from './services/services.service';
import { ServicesModule } from './services/services.module';
import { PrismaModule } from './infra/infra/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [InfraModule, ServicesModule,PrismaModule,  ConfigModule.forRoot({
      isGlobal: true,
    }), AuthModule, UsersModule,],
  controllers: [AppController],
  providers: [AppService, ServicesService],
})
export class AppModule {}
