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
  ],
  imports: [
    UsersModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.register({
      secret: 'supersecret',
      signOptions: {
        expiresIn: '1h',
        issuer: 'my-nest-api',
        audience: 'my-react-client',
      },
    }),
  ],
})
export class AuthModule {}
