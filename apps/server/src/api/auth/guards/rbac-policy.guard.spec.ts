import { INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { BlogStatus, MessageStatus, UserRole } from '@prisma/client';
import request from 'supertest';
import type { App } from 'supertest/types';

import jwtConfig from 'src/config/jwt.config';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { BlogsController } from '../../blogs/blogs.controller';
import { BlogsService } from '../../blogs/blogs.service';
import { ContactMessagesController } from '../../contact-messages/contact-messages.controller';
import { ContactMessagesService } from '../../contact-messages/contact-messages.service';
import { ServicesController } from '../../services/services.controller';
import { ServicesService } from '../../services/services.service';
import { AccessTokenGuard } from './access-token.guard';
import { ActiveUserGuard } from './active-user.guard';
import { RolesGuard } from './roles.guard';

const BLOG_ID = '1b4c6018-49b0-4af5-8975-7252532d9dc8';
const CONTACT_MESSAGE_ID = 'e7112b28-7d74-4c07-83db-dc1b9d7a1486';
const SERVICE_ID = 'ca4f067f-84eb-4fb7-91dd-d9479d76c00d';

type TestUser = {
  role: UserRole;
  isActive: boolean;
  sessionVersion: number;
};

type PrismaMock = {
  user: {
    findUnique: jest.Mock<Promise<TestUser | null>, [unknown]>;
  };
};

type TestApp = {
  app: INestApplication;
  server: App;
  servicesService: Record<string, jest.Mock>;
  blogsService: Record<string, jest.Mock>;
  contactMessagesService: Record<string, jest.Mock>;
};

const usersById: Record<string, TestUser> = {
  'super-admin-id': {
    role: UserRole.SUPER_ADMIN,
    isActive: true,
    sessionVersion: 1,
  },
  'admin-id': {
    role: UserRole.ADMIN,
    isActive: true,
    sessionVersion: 1,
  },
  'employee-id': {
    role: UserRole.EMPLOYEE,
    isActive: true,
    sessionVersion: 1,
  },
  'downgraded-admin-id': {
    role: UserRole.EMPLOYEE,
    isActive: true,
    sessionVersion: 2,
  },
};

function userIdFromToken(token: string): string | undefined {
  return {
    'super-token': 'super-admin-id',
    'admin-token': 'admin-id',
    'employee-token': 'employee-id',
    'stale-admin-token': 'downgraded-admin-id',
  }[token];
}

function createServicesServiceMock(): TestApp['servicesService'] {
  return {
    create: jest.fn().mockResolvedValue({ id: SERVICE_ID }),
    findAll: jest.fn().mockResolvedValue([]),
    findPublic: jest.fn().mockResolvedValue([]),
    getAnalytics: jest.fn().mockResolvedValue({
      services: {
        total: 1,
        totalViews: 10,
      },
      blogs: {
        total: 1,
        totalViews: 5,
      },
      totalServices: 1,
      totalServiceViews: 10,
      mostViewedService: null,
    }),
    createTranslation: jest.fn().mockResolvedValue({ id: 'translation-id' }),
    incrementViewCount: jest.fn().mockResolvedValue({ viewCount: 1 }),
    reorder: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ id: SERVICE_ID }),
    update: jest.fn().mockResolvedValue({ id: SERVICE_ID }),
    remove: jest.fn().mockResolvedValue({ id: SERVICE_ID }),
  };
}

function createBlogsServiceMock(): TestApp['blogsService'] {
  return {
    findPublic: jest.fn().mockResolvedValue({
      data: [
        {
          id: 'published-blog-id',
          status: BlogStatus.PUBLISHED,
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        totalItems: 1,
        totalPages: 1,
      },
    }),
    findAdmin: jest.fn().mockResolvedValue({
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 0,
      },
    }),
    findPublicBySlug: jest.fn().mockResolvedValue({
      id: 'published-blog-id',
      status: BlogStatus.PUBLISHED,
    }),
    incrementViewCount: jest.fn().mockResolvedValue({ viewCount: 1 }),
    findOne: jest.fn().mockResolvedValue({
      id: BLOG_ID,
      status: BlogStatus.DRAFT,
    }),
    create: jest.fn().mockResolvedValue({ id: BLOG_ID }),
    update: jest.fn().mockResolvedValue({ id: BLOG_ID }),
    remove: jest.fn().mockResolvedValue({ blog: { id: BLOG_ID } }),
  };
}

function createContactMessagesServiceMock(): TestApp['contactMessagesService'] {
  return {
    create: jest.fn().mockResolvedValue({ id: CONTACT_MESSAGE_ID }),
    findAdmin: jest.fn().mockResolvedValue({
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 0,
      },
    }),
    getUnreadCount: jest.fn().mockResolvedValue({ count: 0 }),
    findAdminById: jest.fn().mockResolvedValue({ id: CONTACT_MESSAGE_ID }),
    updateStatus: jest.fn().mockResolvedValue({
      id: CONTACT_MESSAGE_ID,
      status: MessageStatus.READ,
    }),
  };
}

async function createTestApp(): Promise<TestApp> {
  const servicesService = createServicesServiceMock();
  const blogsService = createBlogsServiceMock();
  const contactMessagesService = createContactMessagesServiceMock();
  const prismaService: PrismaMock = {
    user: {
      findUnique: jest.fn((args: unknown) => {
        const userId = (args as { where?: { id?: string } }).where?.id;

        return Promise.resolve(userId ? (usersById[userId] ?? null) : null);
      }),
    },
  };

  const moduleRef = await Test.createTestingModule({
    imports: [
      ThrottlerModule.forRoot([
        {
          ttl: 60000,
          limit: 100,
        },
      ]),
    ],
    controllers: [
      ServicesController,
      BlogsController,
      ContactMessagesController,
    ],
    providers: [
      AccessTokenGuard,
      ActiveUserGuard,
      RolesGuard,
      Reflector,
      {
        provide: JwtService,
        useValue: {
          verifyAsync: jest.fn((token: string) => {
            const userId = userIdFromToken(token);

            if (!userId) {
              return Promise.reject(new Error('Invalid token'));
            }

            return Promise.resolve({
              sub: userId,
              email: `${userId}@example.com`,
              sessionVersion: 1,
            });
          }),
        },
      },
      {
        provide: jwtConfig.KEY,
        useValue: {
          secret: 'test-secret',
          audience: 'test-audience',
          issuer: 'test-issuer',
        },
      },
      {
        provide: PrismaService,
        useValue: prismaService,
      },
      {
        provide: ServicesService,
        useValue: servicesService,
      },
      {
        provide: BlogsService,
        useValue: blogsService,
      },
      {
        provide: ContactMessagesService,
        useValue: contactMessagesService,
      },
    ],
  }).compile();

  const app = moduleRef.createNestApplication();

  app.setGlobalPrefix('api');
  await app.init();

  return {
    app,
    server: app.getHttpServer() as App,
    servicesService,
    blogsService,
    contactMessagesService,
  };
}

function withToken(
  server: App,
  method: 'get' | 'post' | 'patch',
  path: string,
  token: string,
) {
  return request(server)[method](path).set('Authorization', `Bearer ${token}`);
}

describe('RBAC policy guard integration', () => {
  let testApp: TestApp | undefined;

  afterEach(async () => {
    await testApp?.app.close();
    testApp = undefined;
  });

  it.each(['super-token', 'admin-token'])(
    'allows %s to read service analytics',
    async (token) => {
      testApp = await createTestApp();

      await withToken(
        testApp.server,
        'get',
        '/api/services/analytics',
        token,
      ).expect(200);

      expect(testApp.servicesService.getAnalytics).toHaveBeenCalledTimes(1);
    },
  );

  it('denies employee and unauthenticated service analytics access', async () => {
    testApp = await createTestApp();

    await withToken(
      testApp.server,
      'get',
      '/api/services/analytics',
      'employee-token',
    ).expect(403);
    await request(testApp.server).get('/api/services/analytics').expect(401);

    expect(testApp.servicesService.getAnalytics).not.toHaveBeenCalled();
  });

  it.each([
    ['/api/blogs/admin', 'findAdmin'],
    [`/api/blogs/${BLOG_ID}`, 'findOne'],
  ])('allows only super admins and admins to read %s', async (path, method) => {
    testApp = await createTestApp();

    await withToken(testApp.server, 'get', path, 'super-token').expect(200);
    await withToken(testApp.server, 'get', path, 'admin-token').expect(200);
    await withToken(testApp.server, 'get', path, 'employee-token').expect(403);
    await request(testApp.server).get(path).expect(401);

    expect(testApp.blogsService[method]).toHaveBeenCalledTimes(2);
  });

  it('preserves employee read access to services and contact messages', async () => {
    testApp = await createTestApp();

    await withToken(testApp.server, 'get', '/api/services', 'employee-token')
      .query({ language: 'EN' })
      .expect(200);
    await withToken(
      testApp.server,
      'get',
      '/api/contact-messages/admin',
      'employee-token',
    ).expect(200);

    expect(testApp.servicesService.findAll).toHaveBeenCalledTimes(1);
    expect(testApp.contactMessagesService.findAdmin).toHaveBeenCalledTimes(1);
  });

  it('denies employee mutations for services, blogs, and message status', async () => {
    testApp = await createTestApp();

    await withToken(testApp.server, 'post', '/api/services', 'employee-token')
      .send({})
      .expect(403);
    await withToken(testApp.server, 'post', '/api/blogs', 'employee-token')
      .send({})
      .expect(403);
    await withToken(
      testApp.server,
      'patch',
      `/api/contact-messages/admin/${CONTACT_MESSAGE_ID}/status`,
      'employee-token',
    )
      .send({ status: MessageStatus.READ })
      .expect(403);

    expect(testApp.servicesService.create).not.toHaveBeenCalled();
    expect(testApp.blogsService.create).not.toHaveBeenCalled();
    expect(testApp.contactMessagesService.updateStatus).not.toHaveBeenCalled();
  });

  it('leaves published blog endpoints public and does not route drafts through public listing', async () => {
    testApp = await createTestApp();

    const response = await request(testApp.server)
      .get('/api/blogs')
      .expect(200);
    await request(testApp.server)
      .get('/api/blogs/slug/published-blog')
      .expect(200);

    const responseBody = response.body as unknown as {
      data: Array<{ status: BlogStatus }>;
    };

    expect(responseBody.data).toEqual([
      expect.objectContaining({
        status: BlogStatus.PUBLISHED,
      }),
    ]);
    expect(testApp.blogsService.findPublic).toHaveBeenCalledTimes(1);
    expect(testApp.blogsService.findAdmin).not.toHaveBeenCalled();
    expect(testApp.blogsService.findPublicBySlug).toHaveBeenCalledWith(
      'published-blog',
    );
  });

  it('rejects a stale admin token after the target user was downgraded', async () => {
    testApp = await createTestApp();

    await withToken(
      testApp.server,
      'get',
      '/api/services/analytics',
      'stale-admin-token',
    ).expect(401);

    expect(testApp.servicesService.getAnalytics).not.toHaveBeenCalled();
  });
});
