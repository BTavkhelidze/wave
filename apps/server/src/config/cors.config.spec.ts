import type { ConfigService } from '@nestjs/config';
import { getCorsConfig } from './cors.config';

const ADMIN_ORIGIN = 'https://admin.waveengineering.ge';
const PUBLIC_ORIGIN = 'https://waveengineering.ge';

function createConfigService(): ConfigService {
  return {
    getOrThrow: jest.fn((key: string) => {
      if (key === 'appConfig.security.trustedBrowserOrigins') {
        return [ADMIN_ORIGIN, PUBLIC_ORIGIN];
      }

      throw new Error(`Unexpected config key ${key}`);
    }),
  } as unknown as ConfigService;
}

function checkOrigin(origin: string | undefined): Promise<boolean> {
  const cors = getCorsConfig(createConfigService());

  return new Promise((resolve, reject) => {
    if (typeof cors.origin !== 'function') {
      reject(new Error('Expected functional CORS origin policy'));
      return;
    }

    cors.origin(origin, (error, allowed) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(Boolean(allowed));
    });
  });
}

describe('getCorsConfig', () => {
  it('approves exact configured origins', async () => {
    await expect(checkOrigin(ADMIN_ORIGIN)).resolves.toBe(true);
    await expect(checkOrigin(PUBLIC_ORIGIN)).resolves.toBe(true);
  });

  it('does not reflect arbitrary origins', async () => {
    await expect(checkOrigin('https://attacker.example')).resolves.toBe(false);
  });
});
