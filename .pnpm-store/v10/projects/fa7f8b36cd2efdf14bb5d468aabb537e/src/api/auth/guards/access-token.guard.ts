import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtVerifyOptions } from '@nestjs/jwt';
import { Request } from 'express';

import type { ConfigType } from '@nestjs/config';
import jwtConfig from 'src/config/jwt.config';
import { ActiveUserGuard } from './active-user.guard';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly activeUserGuard: ActiveUserGuard,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

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

      const payload = await this.jwtService.verifyAsync(token, verifyOptions);

      request['user'] = payload;
    } catch (error) {
      throw new UnauthorizedException();
    }

    return this.activeUserGuard.canActivate(context);
  }

  private extractTokenFromHeader(request: Request): string | undefined {
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
}
