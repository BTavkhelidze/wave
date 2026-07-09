import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { ActiveUserData } from '../interfaces/active-user-data.interface';

type AuthenticatedRequest = Request & {
  user?: ActiveUserData;
};

type ActiveUserProperty = keyof ActiveUserData | 'id';

export const ActiveUser = createParamDecorator(
  (
    data: ActiveUserProperty | undefined,
    context: ExecutionContext,
  ): ActiveUserData | string => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user) {
      throw new UnauthorizedException();
    }

    if (data === 'id') {
      return request.user.sub;
    }

    if (data) {
      return request.user[data];
    }

    return request.user;
  },
);
