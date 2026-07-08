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
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from 'src/infra/infra/prisma/prisma.module';
import { ActiveUserProvider } from './providers/active-user.provider';
import { LogoutProvider } from './providers/logout.provider';

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
    JwtStrategy,
    ActiveUserProvider,
    LogoutProvider,
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
  exports: [PassportModule],
})
export class AuthModule {}
