import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from 'src/config/jwt.config';
import { PrismaModule } from 'src/infra/infra/prisma/prisma.module';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminLogsController } from './admin-logs.controller';
import { AdminLogsService } from './providers/admin-logs.service';
import { FindAdminLogsProvider } from './providers/find-admin-logs.provider';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.register({}),
  ],
  controllers: [AdminLogsController],
  providers: [
    AdminLogsService,
    FindAdminLogsProvider,
    AccessTokenGuard,
    ActiveUserGuard,
    RolesGuard,
  ],
})
export class AdminLogsModule {}
