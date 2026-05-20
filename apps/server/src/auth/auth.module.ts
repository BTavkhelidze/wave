import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { HashProvider } from './providers/hash.provider';
import { BcryptProvider } from './providers/bcrypt.provider';
import { AuthService } from './providers/auth.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, {
    provide: HashProvider,
    useClass: BcryptProvider
  }],
  imports: [UsersModule]
})
export class AuthModule {}
