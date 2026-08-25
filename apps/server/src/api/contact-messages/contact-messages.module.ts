import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from 'src/config/jwt.config';
import { PrismaModule } from 'src/infra/infra/prisma/prisma.module';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MailModule } from '../mail/mail.module';
import { ContactMessagesController } from './contact-messages.controller';
import { ContactMessagesService } from './contact-messages.service';
import { CreateContactMessageProvider } from './providers/create-contact-message.provider';
import { FindContactMessagesProvider } from './providers/find-contact-messages.provider';
import { FindContactMessageByIdProvider } from './providers/find-contact-message-by-id.provider';
import { GetUnreadContactMessageCountProvider } from './providers/get-unread-contact-message-count.provider';
import { UpdateContactMessageStatusProvider } from './providers/update-contact-message-status.provider';

@Module({
  imports: [
    PrismaModule,
    MailModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.register({}),
  ],
  controllers: [ContactMessagesController],
  providers: [
    ContactMessagesService,
    AccessTokenGuard,
    ActiveUserGuard,
    RolesGuard,
    CreateContactMessageProvider,
    FindContactMessagesProvider,
    FindContactMessageByIdProvider,
    GetUnreadContactMessageCountProvider,
    UpdateContactMessageStatusProvider,
  ],
})
export class ContactMessagesModule {}
