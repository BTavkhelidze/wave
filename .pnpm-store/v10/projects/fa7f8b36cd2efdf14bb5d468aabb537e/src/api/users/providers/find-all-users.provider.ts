import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import {
  safeUserSelect,
  type SafeUser,
} from '../constants/safe-user-select.constant';

@Injectable()
export class FindAllUsersProvider {
  constructor(private readonly prismaService: PrismaService) {}

  public async findAllUsers(): Promise<SafeUser[]> {
    try {
      return await this.prismaService.user.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        select: safeUserSelect,
      });
    } catch {
      throw new InternalServerErrorException('Could not fetch users');
    }
  }
}
