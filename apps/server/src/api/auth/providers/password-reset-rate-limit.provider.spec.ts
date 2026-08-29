import { HttpException, HttpStatus } from '@nestjs/common';
import { PasswordResetRateLimitProvider } from './password-reset-rate-limit.provider';

describe('PasswordResetRateLimitProvider', () => {
  it('throws 429 when the key exceeds the configured request limit', () => {
    const provider = new PasswordResetRateLimitProvider({
      passwordReset: {
        rateLimit: {
          windowMs: 60000,
          maxRequests: 2,
        },
      },
    } as never);

    provider.consume('127.0.0.1:admin@example.com');
    provider.consume('127.0.0.1:admin@example.com');

    try {
      provider.consume('127.0.0.1:admin@example.com');
      throw new Error('Expected rate limit to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  });
});
