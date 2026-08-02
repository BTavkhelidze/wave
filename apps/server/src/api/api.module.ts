import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ServicesModule } from './services/services.module';
import { UsersModule } from './users/users.module';
import { AdminLogsModule } from './admin-logs/admin-logs.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    AuthModule,
    ServicesModule,
    UsersModule,
    AdminLogsModule,
    UploadsModule,
  ],
})
export class ApiModule {}
