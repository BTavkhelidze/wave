import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import type { ActiveUserData } from '../interfaces/active-user-data.interface';

type AuthenticatedRequest = Request & {
  user?: ActiveUserData;
};

@Injectable()
export class ActiveUserGuard implements CanActivate {
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
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
