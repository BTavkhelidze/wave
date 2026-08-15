import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from './providers/users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/infra/infra/prisma/prisma.module';
import { FindUserByIdEmailProvider } from './providers/findUserByEmail.provider';
import { FindUserByIdProvider } from './providers/findUserById.provider';
import { UpdateUserRefreshTokenProvider } from './providers/updateUserRefreshToken.provider';
import { UpdateUserActiveStatusProvider } from './providers/updateUserActiveStatus.provider';
import jwtConfig from 'src/config/jwt.config';
import { HashProvider } from '../auth/providers/hash.provider';
import { BcryptProvider } from '../auth/providers/bcrypt.provider';
import { CreateUserByAdminProvider } from './providers/createUserByAdmin.provider';
import { FindAllUsersProvider } from './providers/find-all-users.provider';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { FindUserByIdForAdminProvider } from './providers/find-user-by-id-for-admin.provider';
import { UpdateUserByAdminProvider } from './providers/update-user-by-admin.provider';
import { DeleteUserByAdminProvider } from './providers/delete-user-by-admin.provider';
import { MailModule } from '../mail/mail.module';
import appConfig from 'src/config/app.config';
import { ResetUserPasswordByAdminProvider } from './providers/reset-user-password-by-admin.provider';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: HashProvider,
      useClass: BcryptProvider,
    },
    FindUserByIdEmailProvider,
    FindUserByIdProvider,
    UpdateUserRefreshTokenProvider,
    UpdateUserActiveStatusProvider,
    CreateUserByAdminProvider,
    FindAllUsersProvider,
    FindUserByIdForAdminProvider,
    UpdateUserByAdminProvider,
    DeleteUserByAdminProvider,
    ResetUserPasswordByAdminProvider,
    AccessTokenGuard,
    ActiveUserGuard,
    RolesGuard,
  ],
  exports: [
    UsersService,
    FindUserByIdProvider,
    UpdateUserRefreshTokenProvider,
    UpdateUserActiveStatusProvider,
  ],
  imports: [
    PrismaModule,
    MailModule,
    ConfigModule.forFeature(appConfig),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.register({}),
  ],
})
export class UsersModule {}
