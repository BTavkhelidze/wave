import { Controller, Get, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { applySecurityHeaders } from './security-headers.config';

@Controller()
class SecurityHeadersTestController {
  @Get('health')
  health() {
    return { ok: true };
  }
}

async function createSecurityHeadersApp(
  environment: 'development' | 'production',
): Promise<{ app: INestApplication; server: App }> {
  const configService = {
    getOrThrow: jest.fn((key: string) => {
      if (key === 'appConfig.environment') {
        return environment;
      }

      throw new Error(`Unexpected config key ${key}`);
    }),
  } as unknown as ConfigService;
  const moduleRef = await Test.createTestingModule({
    controllers: [SecurityHeadersTestController],
    providers: [
      {
        provide: ConfigService,
        useValue: configService,
      },
    ],
  }).compile();
  const app = moduleRef.createNestApplication();

  applySecurityHeaders(app, configService);
  await app.init();

  return {
    app,
    server: app.getHttpServer() as App,
  };
}

describe('applySecurityHeaders', () => {
  let testApp: { app: INestApplication; server: App } | undefined;

  afterEach(async () => {
    await testApp?.app.close();
    testApp = undefined;
  });

  it('adds production security headers and removes X-Powered-By', async () => {
    testApp = await createSecurityHeadersApp('production');

    const response = await request(testApp.server)
      .get('/health')
      .expect(200, { ok: true });

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-powered-by']).toBeUndefined();
    expect(response.headers['x-frame-options']).toBeDefined();
    expect(response.headers['referrer-policy']).toBeDefined();
    expect(response.headers['strict-transport-security']).toContain(
      'max-age=31536000',
    );
    expect(response.headers['content-security-policy']).toContain(
      "default-src 'none'",
    );
    expect(response.headers['content-security-policy']).not.toContain(
      "'unsafe-inline'",
    );
  });

  it('does not enable production HSTS or CSP behavior in development', async () => {
    testApp = await createSecurityHeadersApp('development');

    const response = await request(testApp.server)
      .get('/health')
      .expect(200, { ok: true });

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['strict-transport-security']).toBeUndefined();
    expect(response.headers['content-security-policy']).toBeUndefined();
  });
});
