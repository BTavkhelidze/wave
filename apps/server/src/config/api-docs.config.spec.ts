import { Controller, Get, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { setupApiDocumentation } from './api-docs.config';

@Controller()
class DocumentationTestController {
  @Get('health')
  health() {
    return { ok: true };
  }
}

async function createDocumentationApp(
  docsEnabled: boolean,
): Promise<{ app: INestApplication; server: App }> {
  const configService = {
    getOrThrow: jest.fn((key: string) => {
      if (key === 'appConfig.docs.enabled') {
        return docsEnabled;
      }

      if (key === 'appConfig.apiPrefix') {
        return 'api';
      }

      throw new Error(`Unexpected config key ${key}`);
    }),
  } as unknown as ConfigService;
  const moduleRef = await Test.createTestingModule({
    controllers: [DocumentationTestController],
    providers: [
      {
        provide: ConfigService,
        useValue: configService,
      },
    ],
  }).compile();
  const app = moduleRef.createNestApplication();

  app.setGlobalPrefix('api');
  setupApiDocumentation(app, configService);
  await app.init();

  return {
    app,
    server: app.getHttpServer() as App,
  };
}

describe('setupApiDocumentation', () => {
  let testApp: { app: INestApplication; server: App } | undefined;

  afterEach(async () => {
    await testApp?.app.close();
    testApp = undefined;
  });

  it('serves Swagger UI and OpenAPI JSON when enabled', async () => {
    testApp = await createDocumentationApp(true);

    await request(testApp.server).get('/api/docs/').expect(200);
    await request(testApp.server).get('/api/openapi.json').expect(200);
  });

  it('does not expose Swagger UI or OpenAPI JSON when disabled', async () => {
    testApp = await createDocumentationApp(false);

    await request(testApp.server).get('/api/docs').expect(404);
    await request(testApp.server).get('/api/openapi.json').expect(404);
  });

  it('keeps normal API routes available when docs are disabled', async () => {
    testApp = await createDocumentationApp(false);

    await request(testApp.server).get('/api/health').expect(200, { ok: true });
  });
});
