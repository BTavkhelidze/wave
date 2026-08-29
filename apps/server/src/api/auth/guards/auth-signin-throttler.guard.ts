import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Response } from 'express';
import {
  InjectThrottlerOptions,
  InjectThrottlerStorage,
  ThrottlerException,
  ThrottlerGuard,
  type ThrottlerLimitDetail,
  type ThrottlerModuleOptions,
  type ThrottlerStorage,
} from '@nestjs/throttler';

export const SIGN_IN_RATE_LIMIT_MESSAGE =
  'Too many login attempts. Please try again later.';

@Injectable()
export class AuthSignInThrottlerGuard extends ThrottlerGuard {
  constructor(
    @InjectThrottlerOptions()
    options: ThrottlerModuleOptions,
    @InjectThrottlerStorage()
    storageService: ThrottlerStorage,
    reflector: Reflector,
  ) {
    super(options, storageService, reflector);
  }

  protected throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    const response = context.switchToHttp().getResponse<Response>();

    if (
      throttlerLimitDetail.timeToBlockExpire > 0 &&
      typeof response.header === 'function'
    ) {
      response.header(
        'Retry-After',
        String(throttlerLimitDetail.timeToBlockExpire),
      );
    }

    return Promise.reject(new ThrottlerException(SIGN_IN_RATE_LIMIT_MESSAGE));
  }
}
