import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { PrismaModule } from 'src/infra/infra/prisma/prisma.module';
import jwtConfig from 'src/config/jwt.config';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  controllers: [ServicesController],
  providers: [ServicesService, AccessTokenGuard, ActiveUserGuard, RolesGuard],
  imports: [
    PrismaModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.register({}),
  ],
})
export class ServicesModule {}
