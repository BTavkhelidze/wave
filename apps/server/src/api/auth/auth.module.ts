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
import appConfig from 'src/config/app.config';
import { PassportModule } from '@nestjs/passport';

import { PrismaModule } from 'src/infra/infra/prisma/prisma.module';
import { ActiveUserProvider } from './providers/active-user.provider';
import { LogoutProvider } from './providers/logout.provider';
import { ChangePasswordProvider } from './providers/change-password.provider';
import { AccessTokenGuard } from './guards/access-token.guard';
import { ActiveUserGuard } from './guards/active-user.guard';
import { RolesGuard } from './guards/roles.guard';
import { ForgotPasswordProvider } from './providers/forgot-password.provider';
import { ResetPasswordProvider } from './providers/reset-password.provider';
import { PasswordResetTokenProvider } from './providers/password-reset-token.provider';
import { PasswordResetEmailService } from './email/password-reset-email.service';
import { PasswordResetRateLimitProvider } from './providers/password-reset-rate-limit.provider';
import { MailModule } from '../mail/mail.module';
import {
  SIGN_IN_RATE_LIMIT_MESSAGE,
  AuthSignInThrottlerGuard,
} from './guards/auth-signin-throttler.guard';
import { ThrottlerModule } from '@nestjs/throttler';
import type { ConfigType } from '@nestjs/config';

const SECONDS_TO_MILLISECONDS = 1000;

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
    ForgotPasswordProvider,
    ResetPasswordProvider,
    PasswordResetTokenProvider,
    PasswordResetEmailService,
    PasswordResetRateLimitProvider,
    AuthSignInThrottlerGuard,
    AccessTokenGuard,
    ActiveUserGuard,
    RolesGuard,
  ],
  imports: [
    UsersModule,
    PrismaModule,
    MailModule,
    ConfigModule.forFeature(appConfig),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule.forFeature(appConfig)],
      inject: [appConfig.KEY],
      useFactory: (appConfiguration: ConfigType<typeof appConfig>) => ({
        throttlers: [
          {
            name: 'signinBurst',
            ttl:
              appConfiguration.auth.signInRateLimit.burst.windowSeconds *
              SECONDS_TO_MILLISECONDS,
            limit: appConfiguration.auth.signInRateLimit.burst.limit,
          },
          {
            name: 'signinSustained',
            ttl:
              appConfiguration.auth.signInRateLimit.sustained.windowSeconds *
              SECONDS_TO_MILLISECONDS,
            limit: appConfiguration.auth.signInRateLimit.sustained.limit,
          },
        ],
        errorMessage: SIGN_IN_RATE_LIMIT_MESSAGE,
        setHeaders: false,
      }),
    }),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(jwtConfig)],
      inject: [jwtConfig.KEY],
      useFactory: (jwtConfiguration: ConfigType<typeof jwtConfig>) => ({
        secret: jwtConfiguration.secret,
        signOptions: {
          issuer: jwtConfiguration.issuer,
          audience: jwtConfiguration.audience,
        },
      }),
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  exports: [PassportModule, AccessTokenGuard, ActiveUserGuard, RolesGuard],
})
export class AuthModule {}
