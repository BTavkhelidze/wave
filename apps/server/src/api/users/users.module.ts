import { Module } from '@nestjs/common';
import { UsersService } from './providers/users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/infra/infra/prisma/prisma.module';
import { FindUserByIdEmailProvider } from './providers/findUserByEmail.provider';

@Module({
  controllers: [UsersController],
  providers: [UsersService, FindUserByIdEmailProvider],
  exports: [UsersService],
  imports: [PrismaModule]
})
export class UsersModule {}
