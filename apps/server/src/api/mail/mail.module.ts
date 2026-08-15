import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from 'src/config/app.config';
import { MailService } from './mail.service';

@Module({
  imports: [ConfigModule.forFeature(appConfig)],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
