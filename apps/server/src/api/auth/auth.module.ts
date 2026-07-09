import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { HashProvider } from './providers/hash.provider';
import { BcryptProvider } from './providers/bcrypt.provider';
import { AuthService } from './providers/auth.service';

import { SignInProvider } from './providers/signIn.provider';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { GenerateTokenProvider } from './providers/generate-tokens.provider';
import { RefreshTokenProvider } from './providers/refresh-tokens.provider';
import jwtConfig from 'src/config/jwt.config';
import { PassportModule } from '@nestjs/passport';

import { PrismaModule } from 'src/infra/infra/prisma/prisma.module';
import { ActiveUserProvider } from './providers/active-user.provider';
import { LogoutProvider } from './providers/logout.provider';
import { ChangePasswordProvider } from './providers/change-password.provider';
import { AccessTokenGuard } from './guards/access-token.guard';
import { ActiveUserGuard } from './guards/active-user.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: HashProvider,
      useClass: BcryptProvider,
    },
    SignInProvider,
    GenerateTokenProvider,
    RefreshTokenProvider,
    ActiveUserProvider,
    LogoutProvider,
    ChangePasswordProvider,
    AccessTokenGuard,
    ActiveUserGuard,
    RolesGuard,
  ],
  imports: [
    UsersModule,
    PrismaModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.register({
      secret: 'supersecret',
      signOptions: {
        expiresIn: '1h',
        issuer: 'my-nest-api',
        audience: 'my-react-client',
      },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  exports: [PassportModule, AccessTokenGuard, ActiveUserGuard, RolesGuard],
})
export class AuthModule {}
