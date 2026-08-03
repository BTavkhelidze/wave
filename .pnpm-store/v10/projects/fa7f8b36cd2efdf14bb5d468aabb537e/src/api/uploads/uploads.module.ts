import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from 'src/config/jwt.config';
import { PrismaModule } from 'src/infra/infra/prisma/prisma.module';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { StorageService } from './storage.service';
import { UploadsController } from './uploads.controller';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.register({}),
  ],
  controllers: [UploadsController],
  providers: [StorageService, AccessTokenGuard, ActiveUserGuard, RolesGuard],
  exports: [StorageService],
})
export class UploadsModule {}
