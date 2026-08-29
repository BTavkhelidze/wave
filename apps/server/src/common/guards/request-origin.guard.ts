import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { normalizeRequestOrigin } from 'src/config/trusted-browser-origins.config';

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const CROSS_SITE_REQUEST_MESSAGE = 'Cross-site request rejected';

@Injectable()
export class RequestOriginGuard implements CanActivate {
  private readonly trustedOrigins: ReadonlySet<string>;
  private readonly isProduction: boolean;

  constructor(private readonly configService: ConfigService) {
    this.trustedOrigins = new Set(
      this.configService.getOrThrow<string[]>(
        'appConfig.security.trustedBrowserOrigins',
      ),
    );
    this.isProduction =
      this.configService.getOrThrow<string>('appConfig.environment') ===
      'production';
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    if (!UNSAFE_METHODS.has(request.method.toUpperCase())) {
      return true;
    }

    if (this.isExplicitlyCrossSite(request)) {
      throw new ForbiddenException(CROSS_SITE_REQUEST_MESSAGE);
    }

    if (this.hasTrustedOrigin(request)) {
      return true;
    }

    if (!this.isProduction && !this.hasOriginSignal(request)) {
      return true;
    }

    throw new ForbiddenException(CROSS_SITE_REQUEST_MESSAGE);
  }

  private isExplicitlyCrossSite(request: Request): boolean {
    const fetchSite = this.readSingleHeader(request, 'sec-fetch-site');

    return fetchSite?.toLowerCase() === 'cross-site';
  }

  private hasTrustedOrigin(request: Request): boolean {
    const origin = this.readSingleHeader(request, 'origin');

    if (origin) {
      return this.isTrustedOriginValue(origin);
    }

    const referer = this.readSingleHeader(request, 'referer');

    if (!referer) {
      return false;
    }

    return this.isTrustedRefererValue(referer);
  }

  private hasOriginSignal(request: Request): boolean {
    return Boolean(
      this.readSingleHeader(request, 'origin') ||
      this.readSingleHeader(request, 'referer'),
    );
  }

  private readSingleHeader(
    request: Request,
    name: 'origin' | 'referer' | 'sec-fetch-site',
  ): string | undefined {
    const value = request.headers[name];

    if (Array.isArray(value)) {
      return undefined;
    }

    return value?.trim();
  }

  private isTrustedOriginValue(value: string): boolean {
    try {
      return this.trustedOrigins.has(normalizeRequestOrigin(value));
    } catch {
      return false;
    }
  }

  private isTrustedRefererValue(value: string): boolean {
    try {
      return this.trustedOrigins.has(new URL(value).origin);
    } catch {
      return false;
    }
  }
}
