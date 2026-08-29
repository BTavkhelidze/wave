import {
  Controller,
  Get,
  Inject,
  INestApplication,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import type { Response } from 'express';
import request from 'supertest';
import type { App } from 'supertest/types';
import { getCorsConfig } from 'src/config/cors.config';
import { clearAuthCookies, setAuthCookies } from '../http/auth-cookie-options';
import { RequestOriginGuard } from './request-origin.guard';

const ADMIN_ORIGIN = 'https://admin.waveengineering.ge';
const PUBLIC_ORIGIN = 'https://waveengineering.ge';
const LOCAL_CLIENT_ORIGIN = 'http://localhost:3000';

type TestApp = {
  app: INestApplication;
  server: App;
  calls: {
    signIn: jest.Mock;
    refresh: jest.Mock;
    logout: jest.Mock;
    mutation: jest.Mock;
    passwordChange: jest.Mock;
    contact: jest.Mock;
  };
};

function createConfigService(
  environment = 'production',
  trustedOrigins = [ADMIN_ORIGIN, PUBLIC_ORIGIN],
): ConfigService {
  return {
    getOrThrow: jest.fn((key: string) => {
      if (key === 'appConfig.security.trustedBrowserOrigins') {
        return trustedOrigins;
      }

      if (key === 'appConfig.environment') {
        return environment;
      }

      throw new Error(`Unexpected config key ${key}`);
    }),
  } as unknown as ConfigService;
}

@Controller()
class CsrfTestController {
  constructor(
    private readonly configService: ConfigService,
    @Inject('CSRF_TEST_CALLS')
    private readonly calls: TestApp['calls'],
  ) {}

  @Post('auth/signin')
  signIn(@Res({ passthrough: true }) res: Response) {
    this.calls.signIn();
    setAuthCookies(
      res,
      {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      },
      this.configService,
    );

    return { ok: true };
  }

  @Post('auth/refresh-token')
  refresh() {
    this.calls.refresh();

    return { ok: true };
  }

  @Post('auth/logout')
  logout(@Res({ passthrough: true }) res: Response) {
    this.calls.logout();
    clearAuthCookies(res, this.configService);

    return { ok: true };
  }

  @Patch('users/user-id')
  mutation() {
    this.calls.mutation();

    return { ok: true };
  }

  @Patch('auth/change-password')
  passwordChange() {
    this.calls.passwordChange();

    return { ok: true };
  }

  @Post('contact-messages')
  contact() {
    this.calls.contact();

    return { ok: true };
  }

  @Get('users')
  safeGet() {
    return { ok: true };
  }
}

async function createTestApp(
  environment = 'production',
  trustedOrigins = [ADMIN_ORIGIN, PUBLIC_ORIGIN],
): Promise<TestApp> {
  const calls = {
    signIn: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    mutation: jest.fn(),
    passwordChange: jest.fn(),
    contact: jest.fn(),
  };
  const configService = createConfigService(environment, trustedOrigins);
  const moduleRef = await Test.createTestingModule({
    controllers: [CsrfTestController],
    providers: [
      {
        provide: ConfigService,
        useValue: configService,
      },
      {
        provide: 'CSRF_TEST_CALLS',
        useValue: calls,
      },
      {
        provide: APP_GUARD,
        useClass: RequestOriginGuard,
      },
    ],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');
  app.enableCors(getCorsConfig(configService));
  await app.init();

  return {
    app,
    server: app.getHttpServer() as App,
    calls,
  };
}

function serializedSetCookie(response: request.Response): string {
  const cookies = response.headers['set-cookie'] ?? [];

  return Array.isArray(cookies) ? cookies.join(';') : cookies;
}

describe('RequestOriginGuard', () => {
  let testApp: TestApp | undefined;

  afterEach(async () => {
    await testApp?.app.close();
    testApp = undefined;
  });

  it('allows trusted Admin origin to reach sign-in and set hardened production cookies', async () => {
    testApp = await createTestApp();

    const response = await request(testApp.server)
      .post('/api/auth/signin')
      .set('Origin', ADMIN_ORIGIN)
      .send({})
      .expect(201);

    const cookies = serializedSetCookie(response);

    expect(testApp.calls.signIn).toHaveBeenCalledTimes(1);
    expect(cookies).toContain('refreshToken=refresh-token');
    expect(cookies).toContain('accessToken=access-token');
    expect(cookies).toContain('HttpOnly');
    expect(cookies).toContain('Secure');
    expect(cookies).toContain('SameSite=Strict');
    expect(cookies).not.toContain('Domain=');
  });

  it('allows trusted Admin origin to refresh and sign out', async () => {
    testApp = await createTestApp();

    await request(testApp.server)
      .post('/api/auth/refresh-token')
      .set('Origin', ADMIN_ORIGIN)
      .send({})
      .expect(201);
    const logoutResponse = await request(testApp.server)
      .post('/api/auth/logout')
      .set('Origin', ADMIN_ORIGIN)
      .send({})
      .expect(201);

    expect(testApp.calls.refresh).toHaveBeenCalledTimes(1);
    expect(testApp.calls.logout).toHaveBeenCalledTimes(1);
    expect(serializedSetCookie(logoutResponse)).toContain('SameSite=Strict');
  });

  it('allows trusted public website origin to submit the public contact form', async () => {
    testApp = await createTestApp();

    await request(testApp.server)
      .post('/api/contact-messages')
      .set('Origin', PUBLIC_ORIGIN)
      .send({})
      .expect(201);

    expect(testApp.calls.contact).toHaveBeenCalledTimes(1);
  });

  it('rejects untrusted cross-site origins before business logic', async () => {
    testApp = await createTestApp();

    await request(testApp.server)
      .patch('/api/users/user-id')
      .set('Origin', 'https://attacker.example')
      .send({})
      .expect(403);

    expect(testApp.calls.mutation).not.toHaveBeenCalled();
  });

  it('protects the authenticated password-change endpoint with exact trusted browser origins', async () => {
    testApp = await createTestApp();

    await request(testApp.server)
      .patch('/api/auth/change-password')
      .set('Origin', 'https://attacker.example')
      .send({})
      .expect(403);
    await request(testApp.server)
      .patch('/api/auth/change-password')
      .set('Origin', ADMIN_ORIGIN)
      .send({})
      .expect(200);

    expect(testApp.calls.passwordChange).toHaveBeenCalledTimes(1);
  });

  it('rejects unlisted same-site subdomains before business logic', async () => {
    testApp = await createTestApp();

    await request(testApp.server)
      .patch('/api/users/user-id')
      .set('Origin', 'https://attacker.waveengineering.ge')
      .set('Sec-Fetch-Site', 'same-site')
      .send({})
      .expect(403);

    expect(testApp.calls.mutation).not.toHaveBeenCalled();
  });

  it.each([
    ['null Origin', { Origin: 'null' }],
    ['malformed Origin', { Origin: 'not-a-url' }],
    [
      'multiple Origin values',
      { Origin: `${ADMIN_ORIGIN}, https://attacker.example` },
    ],
    ['missing Origin and Referer', {}],
  ])('rejects %s for unsafe requests', async (_name, headers) => {
    testApp = await createTestApp();

    await request(testApp.server)
      .patch('/api/users/user-id')
      .set(headers)
      .send({})
      .expect(403);

    expect(testApp.calls.mutation).not.toHaveBeenCalled();
  });

  it('allows origin-less unsafe requests outside production for local API clients', async () => {
    testApp = await createTestApp('development');

    await request(testApp.server)
      .patch('/api/users/user-id')
      .send({})
      .expect(200);

    expect(testApp.calls.mutation).toHaveBeenCalledTimes(1);
  });

  it('allows exact Referer fallback when Origin is absent', async () => {
    testApp = await createTestApp();

    await request(testApp.server)
      .patch('/api/users/user-id')
      .set('Referer', `${ADMIN_ORIGIN}/users`)
      .send({})
      .expect(200);

    expect(testApp.calls.mutation).toHaveBeenCalledTimes(1);
  });

  it('rejects cross-site Fetch Metadata even with an allowed Origin', async () => {
    testApp = await createTestApp();

    await request(testApp.server)
      .patch('/api/users/user-id')
      .set('Origin', ADMIN_ORIGIN)
      .set('Sec-Fetch-Site', 'cross-site')
      .send({})
      .expect(403);

    expect(testApp.calls.mutation).not.toHaveBeenCalled();
  });

  it('does not let same-site Fetch Metadata bypass exact Origin validation', async () => {
    testApp = await createTestApp();

    await request(testApp.server)
      .patch('/api/users/user-id')
      .set('Origin', 'https://evil-admin.waveengineering.ge')
      .set('Sec-Fetch-Site', 'same-site')
      .send({})
      .expect(403);

    expect(testApp.calls.mutation).not.toHaveBeenCalled();
  });

  it('does not reject safe methods or preflight requests', async () => {
    testApp = await createTestApp();

    await request(testApp.server).get('/api/users').expect(200);
    await request(testApp.server)
      .options('/api/users/user-id')
      .set('Origin', ADMIN_ORIGIN)
      .set('Access-Control-Request-Method', 'PATCH')
      .expect(204);
  });

  it('does not approve arbitrary origins in CORS', async () => {
    testApp = await createTestApp();

    const response = await request(testApp.server)
      .options('/api/users/user-id')
      .set('Origin', 'https://attacker.example')
      .set('Access-Control-Request-Method', 'PATCH');

    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('returns CORS credentials headers for the configured local client origin', async () => {
    testApp = await createTestApp('development', [
      LOCAL_CLIENT_ORIGIN,
      'http://localhost:5173',
      ADMIN_ORIGIN,
      PUBLIC_ORIGIN,
    ]);

    const response = await request(testApp.server)
      .get('/api/users')
      .set('Origin', LOCAL_CLIENT_ORIGIN)
      .expect(200);

    expect(response.headers['access-control-allow-origin']).toBe(
      LOCAL_CLIENT_ORIGIN,
    );
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });
});
