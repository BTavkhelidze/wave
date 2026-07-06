import { Module } from '@nestjs/common';
import { UsersService } from './providers/users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/infra/infra/prisma/prisma.module';
import { FindUserByIdEmailProvider } from './providers/findUserByEmail.provider';
import { FindUserByIdProvider } from './providers/findUserById.provider';

@Module({
  controllers: [UsersController],
  providers: [UsersService, FindUserByIdEmailProvider, FindUserByIdProvider],
  exports: [UsersService, FindUserByIdProvider],
  imports: [PrismaModule],
})
export class UsersModule {}
