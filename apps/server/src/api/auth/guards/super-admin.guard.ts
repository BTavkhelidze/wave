import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import type { Request } from 'express';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import type { ActiveUserData } from '../interfaces/active-user-data.interface';

type AuthenticatedRequest = Request & {
  user?: ActiveUserData;
};

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user?.sub;

    if (!userId) {
      throw new UnauthorizedException();
    }

    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }

    if (user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('No access!');
    }

    return true;
  }
}
