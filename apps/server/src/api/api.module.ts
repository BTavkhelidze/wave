import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ServicesModule } from './services/services.module';
import { UsersModule } from './users/users.module';
import { AdminLogsModule } from './admin-logs/admin-logs.module';
import { UploadsModule } from './uploads/uploads.module';
import { BlogsModule } from './blogs/blogs.module';
import { ContactMessagesModule } from './contact-messages/contact-messages.module';
import { OutboundEmailsModule } from './outbound-emails/outbound-emails.module';

@Module({
  imports: [
    AuthModule,
    ServicesModule,
    UsersModule,
    AdminLogsModule,
    UploadsModule,
    BlogsModule,
    ContactMessagesModule,
    OutboundEmailsModule,
  ],
})
export class ApiModule {}
