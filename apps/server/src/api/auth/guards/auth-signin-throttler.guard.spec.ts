import { Controller, INestApplication, Post } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';
import type { App } from 'supertest/types';
import type { Response } from 'express';

import { AuthController } from '../auth.controller';
import { SignInDto } from '../dtos/signIn.dto';
import { AccessTokenGuard } from './access-token.guard';
import { ActiveUserGuard } from './active-user.guard';
import { AuthService } from '../providers/auth.service';
import { RolesGuard } from './roles.guard';
import {
  AuthSignInThrottlerGuard,
  SIGN_IN_RATE_LIMIT_MESSAGE,
} from './auth-signin-throttler.guard';

const SUCCESS_RESPONSE = {
  status: 200,
  message: 'User signed in successfully',
};

const SIGN_IN_DTO: SignInDto = {
  email: 'admin@example.com',
  password: 'correct-horse-battery-staple',
};

type TestApp = {
  app: INestApplication;
  server: App;
  authService: {
    signIn: jest.Mock<typeof SUCCESS_RESPONSE, [SignInDto, Response]>;
  };
};

@Controller('unrelated')
class UnrelatedController {
  @Post()
  public create() {
    return { ok: true };
  }
}

async function createTestApp(options?: {
  burstLimit?: number;
  burstWindowMs?: number;
  sustainedLimit?: number;
  sustainedWindowMs?: number;
}): Promise<TestApp> {
  const authService = {
    signIn: jest.fn((_signInDto: SignInDto, res: Response) => {
      res.cookie('refreshToken', 'refresh-token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.cookie('accessToken', 'access-token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 15 * 60 * 1000,
      });

      return SUCCESS_RESPONSE;
    }),
  };

  const moduleBuilder = Test.createTestingModule({
    imports: [
      ThrottlerModule.forRoot({
        throttlers: [
          {
            name: 'signinBurst',
            ttl: options?.burstWindowMs ?? 60000,
            limit: options?.burstLimit ?? 5,
          },
          {
            name: 'signinSustained',
            ttl: options?.sustainedWindowMs ?? 900000,
            limit: options?.sustainedLimit ?? 20,
          },
        ],
        errorMessage: SIGN_IN_RATE_LIMIT_MESSAGE,
        setHeaders: false,
      }),
    ],
    controllers: [AuthController, UnrelatedController],
    providers: [
      AuthSignInThrottlerGuard,
      {
        provide: AuthService,
        useValue: authService,
      },
    ],
  })
    .overrideGuard(AccessTokenGuard)
    .useValue({
      canActivate: jest.fn(() => true),
    })
    .overrideGuard(ActiveUserGuard)
    .useValue({
      canActivate: jest.fn(() => true),
    })
    .overrideGuard(RolesGuard)
    .useValue({
      canActivate: jest.fn(() => true),
    });

  const moduleRef = await moduleBuilder.compile();

  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');
  await app.init();

  return {
    app,
    server: app.getHttpServer() as App,
    authService,
  };
}

describe('AuthSignInThrottlerGuard', () => {
  let testApp: TestApp | undefined;

  afterEach(async () => {
    await testApp?.app.close();
    testApp = undefined;
  });

  it('allows requests below the burst threshold to reach sign-in', async () => {
    testApp = await createTestApp();

    for (let requestIndex = 0; requestIndex < 5; requestIndex += 1) {
      await request(testApp.server)
        .post('/api/auth/signin')
        .send(SIGN_IN_DTO)
        .expect(201);
    }

    expect(testApp.authService.signIn).toHaveBeenCalledTimes(5);
  });

  it('rejects the next request after the burst threshold with a generic 429', async () => {
    testApp = await createTestApp();

    for (let requestIndex = 0; requestIndex < 5; requestIndex += 1) {
      await request(testApp.server)
        .post('/api/auth/signin')
        .send(SIGN_IN_DTO)
        .expect(201);
    }

    const response = await request(testApp.server)
      .post('/api/auth/signin')
      .send({
        email: 'missing-admin@example.com',
        password: 'wrong-password',
      })
      .expect(429);

    const responseBody = JSON.stringify(response.body as unknown);
    const responseMessage = (response.body as { message?: unknown }).message;

    expect(responseMessage).toBe(SIGN_IN_RATE_LIMIT_MESSAGE);
    expect(response.headers['retry-after']).toBeDefined();
    expect(responseBody).not.toContain('missing-admin@example.com');
    expect(responseBody).not.toContain('signinBurst');
    expect(responseBody).not.toContain('signinSustained');
    expect(testApp.authService.signIn).toHaveBeenCalledTimes(5);
  });

  it('preserves successful sign-in response and cookies before throttling', async () => {
    testApp = await createTestApp();

    const response = await request(testApp.server)
      .post('/api/auth/signin')
      .send(SIGN_IN_DTO)
      .expect(201);

    const cookies = response.headers['set-cookie'] ?? [];
    const serializedCookies = Array.isArray(cookies)
      ? cookies.join(';')
      : cookies;

    expect(response.body).toEqual(SUCCESS_RESPONSE);
    expect(serializedCookies).toContain('refreshToken=refresh-token');
    expect(serializedCookies).toContain('accessToken=access-token');
    expect(serializedCookies).toContain('HttpOnly');
    expect(serializedCookies).toContain('SameSite=Lax');
  });

  it('does not apply strict sign-in limits to unrelated endpoints', async () => {
    testApp = await createTestApp();

    for (let requestIndex = 0; requestIndex < 6; requestIndex += 1) {
      await request(testApp.server).post('/api/unrelated').send({}).expect(201);
    }

    expect(testApp.authService.signIn).not.toHaveBeenCalled();
  });

  it('enforces the sustained policy without waiting for the real window', async () => {
    testApp = await createTestApp({
      burstLimit: 100,
      sustainedLimit: 20,
      sustainedWindowMs: 900000,
    });

    for (let requestIndex = 0; requestIndex < 20; requestIndex += 1) {
      await request(testApp.server)
        .post('/api/auth/signin')
        .send(SIGN_IN_DTO)
        .expect(201);
    }

    await request(testApp.server)
      .post('/api/auth/signin')
      .send(SIGN_IN_DTO)
      .expect(429);

    expect(testApp.authService.signIn).toHaveBeenCalledTimes(20);
  });
});
