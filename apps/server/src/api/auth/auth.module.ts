import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { HashProvider } from './providers/hash.provider';
import { BcryptProvider } from './providers/bcrypt.provider';
import { AuthService } from './providers/auth.service';

import { SignInProvider } from './providers/signIn.provider';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: HashProvider,
      useClass: BcryptProvider,
    },
    SignInProvider,
  ],
  imports: [
    UsersModule,
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
