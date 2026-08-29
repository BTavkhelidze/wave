import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from 'src/config/jwt.config';
import { PrismaModule } from 'src/infra/infra/prisma/prisma.module';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MailModule } from '../mail/mail.module';
import { OutboundEmailsController } from './outbound-emails.controller';
import { OutboundEmailsService } from './outbound-emails.service';
import { FindOutboundEmailByIdProvider } from './providers/find-outbound-email-by-id.provider';
import { FindOutboundEmailsProvider } from './providers/find-outbound-emails.provider';
import { SendOutboundEmailProvider } from './providers/send-outbound-email.provider';

@Module({
  imports: [
    PrismaModule,
    MailModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.register({}),
  ],
  controllers: [OutboundEmailsController],
  providers: [
    OutboundEmailsService,
    AccessTokenGuard,
    ActiveUserGuard,
    RolesGuard,
    SendOutboundEmailProvider,
    FindOutboundEmailsProvider,
    FindOutboundEmailByIdProvider,
  ],
})
export class OutboundEmailsModule {}
