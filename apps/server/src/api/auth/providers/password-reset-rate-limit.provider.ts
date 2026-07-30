import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import appConfig from 'src/config/app.config';

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

@Injectable()
export class PasswordResetRateLimitProvider {
  private readonly requests = new Map<string, RateLimitRecord>();

  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
  ) {}

  public consume(key: string): void {
    const now = Date.now();
    const windowMs =
      this.appConfiguration.passwordReset.rateLimit.windowMs;
    const maxRequests =
      this.appConfiguration.passwordReset.rateLimit.maxRequests;
    const current = this.requests.get(key);

    if (!current || current.resetAt <= now) {
      this.requests.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return;
    }

    if (current.count >= maxRequests) {
      throw new HttpException(
        'Too many password reset requests. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    current.count += 1;
  }
}
