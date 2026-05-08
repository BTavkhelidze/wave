import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InfraModule } from './infra/infra/infra.module';
import { ServicesService } from './services/services.service';
import { ServicesModule } from './services/services.module';

@Module({
  imports: [InfraModule, ServicesModule,],
  controllers: [AppController],
  providers: [AppService, ServicesService],
})
export class AppModule {}
