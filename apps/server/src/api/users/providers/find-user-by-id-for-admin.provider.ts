import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import {
  safeUserSelect,
  type SafeUser,
} from '../constants/safe-user-select.constant';

@Injectable()
export class FindUserByIdForAdminProvider {
  constructor(private readonly prismaService: PrismaService) {}

  public async findUserByIdForAdmin(userId: string): Promise<SafeUser> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
        select: safeUserSelect,
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Could not fetch user');
    }
  }
}
