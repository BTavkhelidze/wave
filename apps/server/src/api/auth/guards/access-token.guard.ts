import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtVerifyOptions } from '@nestjs/jwt';
import type { Request } from 'express';

import type { ConfigType } from '@nestjs/config';
import jwtConfig from 'src/config/jwt.config';
import { ActiveUserGuard } from './active-user.guard';
import type { ActiveUserData } from '../interfaces/active-user-data.interface';
import { isValidSessionVersionClaim } from '../utils/session-version-claim.util';

type AuthenticatedRequest = Omit<Request, 'cookies'> & {
  cookies?: Record<string, unknown>;
  user?: ActiveUserData;
};

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly activeUserGuard: ActiveUserGuard,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const verifyOptions: JwtVerifyOptions = {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      };

      const payload = await this.jwtService.verifyAsync<
        Record<string, unknown>
      >(token, verifyOptions);

      if (!this.isActiveUserData(payload)) {
        throw new UnauthorizedException();
      }

      request.user = payload;
    } catch {
      throw new UnauthorizedException();
    }

    return this.activeUserGuard.canActivate(context);
  }

  private extractTokenFromHeader(
    request: AuthenticatedRequest,
  ): string | undefined {
    const cookieToken = request.cookies?.accessToken;

    if (typeof cookieToken === 'string') {
      return cookieToken;
    }

    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      return undefined;
    }

    return authorization.slice(7);
  }

  private isActiveUserData(payload: unknown): payload is ActiveUserData {
    return (
      typeof payload === 'object' &&
      payload !== null &&
      'sub' in payload &&
      'email' in payload &&
      'sessionVersion' in payload &&
      typeof payload.sub === 'string' &&
      payload.sub.length > 0 &&
      typeof payload.email === 'string' &&
      payload.email.length > 0 &&
      isValidSessionVersionClaim(payload.sessionVersion)
    );
  }
}
