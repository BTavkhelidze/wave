import { BadRequestException } from '@nestjs/common';
import { AdminAction, AdminEntity, BlogStatus, Language } from '@prisma/client';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { BlogsService } from './blogs.service';
import type { CreateBlogDto } from './dto/create-blog.dto';

describe('BlogsService create', () => {
  const adminId = 'admin-id';
  const createdBlog = {
    id: 'blog-id',
    title: 'English title',
    slug: 'english-title',
    excerpt: 'English excerpt',
    content: '<p>English content</p>',
    coverImageKey: 'images/cover.webp',
    coverImageUrl: 'https://bucket.example.com/images/cover.webp',
    language: Language.EN,
    status: BlogStatus.DRAFT,
    isFeatured: false,
    publishedAt: null,
    createdAt: new Date('2026-08-08T10:00:00.000Z'),
    updatedAt: new Date('2026-08-08T10:00:00.000Z'),
  };

  const createBlogDto: CreateBlogDto = {
    coverImageKey: 'images/cover.webp',
    coverImageUrl: 'https://bucket.example.com/images/cover.webp',
    status: BlogStatus.DRAFT,
    isFeatured: false,
    translations: [
      {
        language: Language.KA,
        title: ' Georgian title ',
        slug: 'georgian-title',
        excerpt: ' Georgian excerpt ',
        content: '<p>Georgian content</p><script>alert(1)</script>',
        metaTitle: ' Georgian title | Wave ',
        metaDescription: ' Georgian meta description ',
      },
      {
        language: Language.EN,
        title: ' English title ',
        slug: 'english-title',
        excerpt: ' English excerpt ',
        content: '<p>English content</p>',
        metaTitle: ' English title | Wave ',
        metaDescription: ' English meta description ',
      },
    ],
  };

  let tx: {
    blog: {
      create: jest.Mock<Promise<typeof createdBlog>, [unknown]>;
    };
    adminLog: {
      create: jest.Mock<Promise<unknown>, [unknown]>;
    };
  };
  let prismaService: {
    $transaction: jest.Mock<
      Promise<typeof createdBlog>,
      [callback: (tx: typeof tx) => Promise<typeof createdBlog>]
    >;
  };
  let service: BlogsService;

  beforeEach(() => {
    tx = {
      blog: {
        create: jest
          .fn<Promise<typeof createdBlog>, [unknown]>()
          .mockResolvedValue(createdBlog),
      },
      adminLog: {
        create: jest
          .fn<Promise<unknown>, [unknown]>()
          .mockResolvedValue({ id: 'log-id' }),
      },
    };
    prismaService = {
      $transaction: jest
        .fn<
          Promise<typeof createdBlog>,
          [callback: (tx: typeof tx) => Promise<typeof createdBlog>]
        >()
        .mockImplementation((callback) => callback(tx)),
    };
    service = new BlogsService(prismaService as unknown as PrismaService);
  });

  it('creates one blog with KA and EN translations atomically', async () => {
    await expect(service.create(createBlogDto, adminId)).resolves.toEqual(
      createdBlog,
    );

    expect(prismaService.$transaction).toHaveBeenCalledTimes(1);
    const [createArg] = tx.blog.create.mock.calls[0] ?? [];

    expect(createArg).toMatchObject({
      data: {
        title: 'English title',
        slug: 'english-title',
        excerpt: 'English excerpt',
        content: '<p>English content</p>',
        coverImageKey: 'images/cover.webp',
        coverImageUrl: 'https://bucket.example.com/images/cover.webp',
        language: Language.EN,
        translations: {
          create: [
            {
              language: Language.KA,
              title: 'Georgian title',
              slug: 'georgian-title',
              excerpt: 'Georgian excerpt',
              content: '<p>Georgian content</p>',
              metaTitle: 'Georgian title | Wave',
              metaDescription: 'Georgian meta description',
            },
            {
              language: Language.EN,
              title: 'English title',
              slug: 'english-title',
              excerpt: 'English excerpt',
              content: '<p>English content</p>',
              metaTitle: 'English title | Wave',
              metaDescription: 'English meta description',
            },
          ],
        },
      },
    });
    expect(createArg).toHaveProperty('select');
    expect(tx.adminLog.create).toHaveBeenCalledWith({
      data: {
        userId: adminId,
        action: AdminAction.CREATE,
        entity: AdminEntity.BLOG,
        entityId: createdBlog.id,
      },
    });
  });

  it('rejects duplicate translation languages before opening a transaction', async () => {
    await expect(
      service.create(
        {
          ...createBlogDto,
          translations: [
            createBlogDto.translations[1],
            createBlogDto.translations[1],
          ],
        },
        adminId,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prismaService.$transaction).not.toHaveBeenCalled();
  });
});

describe('BlogsService update', () => {
  const adminId = 'admin-id';
  const updatedBlog = {
    id: 'blog-id',
    title: 'Updated English title',
    slug: 'updated-english-title',
    excerpt: 'Updated English excerpt',
    content: '<p>Updated English content</p>',
    coverImageKey: 'images/new-cover.webp',
    coverImageUrl: 'https://bucket.example.com/images/new-cover.webp',
    language: Language.EN,
    status: BlogStatus.PUBLISHED,
    isFeatured: true,
    publishedAt: new Date('2026-08-08T12:00:00.000Z'),
    createdAt: new Date('2026-08-08T10:00:00.000Z'),
    updatedAt: new Date('2026-08-08T12:00:00.000Z'),
    translations: [
      {
        id: 'translation-en',
        language: Language.EN,
        title: 'Updated English title',
        slug: 'updated-english-title',
        excerpt: 'Updated English excerpt',
        content: '<p>Updated English content</p>',
        metaTitle: 'Updated English title | Wave',
        metaDescription: 'Updated English meta description',
      },
      {
        id: 'translation-ka',
        language: Language.KA,
        title: 'Updated Georgian title',
        slug: 'updated-georgian-title',
        excerpt: 'Updated Georgian excerpt',
        content: '<p>Updated Georgian content</p>',
        metaTitle: 'Updated Georgian title | Wave',
        metaDescription: 'Updated Georgian meta description',
      },
    ],
  };

  const updateBlogDto = {
    coverImageKey: ' images/new-cover.webp ',
    coverImageUrl: ' https://bucket.example.com/images/new-cover.webp ',
    status: BlogStatus.PUBLISHED,
    isFeatured: true,
    translations: [
      {
        language: Language.KA,
        title: ' Updated Georgian title ',
        slug: 'updated-georgian-title',
        excerpt: ' Updated Georgian excerpt ',
        content: '<p>Updated Georgian content</p>',
        metaTitle: ' Updated Georgian title | Wave ',
        metaDescription: ' Updated Georgian meta description ',
      },
      {
        language: Language.EN,
        title: ' Updated English title ',
        slug: 'updated-english-title',
        excerpt: ' Updated English excerpt ',
        content: '<p>Updated English content</p>',
        metaTitle: ' Updated English title | Wave ',
        metaDescription: ' Updated English meta description ',
      },
    ],
  };

  let tx: {
    blog: {
      findUnique: jest.Mock<Promise<unknown>, [unknown]>;
      update: jest.Mock<Promise<typeof updatedBlog>, [unknown]>;
    };
    blogTranslation: {
      update: jest.Mock<Promise<unknown>, [unknown]>;
    };
    adminLog: {
      create: jest.Mock<Promise<unknown>, [unknown]>;
    };
  };
  let prismaService: {
    $transaction: jest.Mock<
      Promise<typeof updatedBlog>,
      [callback: (tx: typeof tx) => Promise<typeof updatedBlog>]
    >;
  };
  let service: BlogsService;

  beforeEach(() => {
    tx = {
      blog: {
        findUnique: jest
          .fn<Promise<unknown>, [unknown]>()
          .mockResolvedValueOnce({
            id: updatedBlog.id,
            status: BlogStatus.DRAFT,
            publishedAt: null,
            translations: [
              { language: Language.KA },
              { language: Language.EN },
            ],
          })
          .mockResolvedValueOnce(updatedBlog),
        update: jest
          .fn<Promise<typeof updatedBlog>, [unknown]>()
          .mockResolvedValue(updatedBlog),
      },
      blogTranslation: {
        update: jest
          .fn<Promise<unknown>, [unknown]>()
          .mockResolvedValue({ id: 'translation-id' }),
      },
      adminLog: {
        create: jest
          .fn<Promise<unknown>, [unknown]>()
          .mockResolvedValue({ id: 'log-id' }),
      },
    };
    prismaService = {
      $transaction: jest
        .fn<
          Promise<typeof updatedBlog>,
          [callback: (tx: typeof tx) => Promise<typeof updatedBlog>]
        >()
        .mockImplementation((callback) => callback(tx)),
    };
    service = new BlogsService(prismaService as unknown as PrismaService);
  });

  it('updates the parent blog and both translations atomically', async () => {
    await expect(
      service.update(updatedBlog.id, updateBlogDto, adminId),
    ).resolves.toEqual(updatedBlog);

    expect(prismaService.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.blog.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: updatedBlog.id },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: expect.objectContaining({
          title: 'Updated English title',
          slug: 'updated-english-title',
          excerpt: 'Updated English excerpt',
          content: '<p>Updated English content</p>',
          coverImageKey: 'images/new-cover.webp',
          coverImageUrl: 'https://bucket.example.com/images/new-cover.webp',
          language: Language.EN,
          status: BlogStatus.PUBLISHED,
          isFeatured: true,
        }),
      }),
    );
    expect(tx.blogTranslation.update).toHaveBeenCalledTimes(2);
    expect(tx.blogTranslation.update).toHaveBeenCalledWith({
      where: {
        blogId_language: {
          blogId: updatedBlog.id,
          language: Language.KA,
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: expect.objectContaining({
        title: 'Updated Georgian title',
        slug: 'updated-georgian-title',
      }),
    });
    expect(tx.blogTranslation.update).toHaveBeenCalledWith({
      where: {
        blogId_language: {
          blogId: updatedBlog.id,
          language: Language.EN,
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: expect.objectContaining({
        title: 'Updated English title',
        slug: 'updated-english-title',
      }),
    });
    expect(tx.adminLog.create).toHaveBeenCalledWith({
      data: {
        userId: adminId,
        action: AdminAction.UPDATE,
        entity: AdminEntity.BLOG,
        entityId: updatedBlog.id,
      },
    });
  });

  it('rejects update when the existing blog is missing a required translation', async () => {
    tx.blog.findUnique.mockReset();
    tx.blog.findUnique.mockResolvedValueOnce({
      id: updatedBlog.id,
      status: BlogStatus.DRAFT,
      publishedAt: null,
      translations: [{ language: Language.KA }],
    });

    await expect(
      service.update(updatedBlog.id, updateBlogDto, adminId),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(tx.blog.update).not.toHaveBeenCalled();
    expect(tx.blogTranslation.update).not.toHaveBeenCalled();
  });

  it('rejects localized root-field updates without both translations', async () => {
    await expect(
      service.update(
        updatedBlog.id,
        {
          title: 'Root-only title',
        },
        adminId,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prismaService.$transaction).not.toHaveBeenCalled();
  });
});

describe('BlogsService remove', () => {
  const adminId = 'admin-id';
  const deletedBlog = {
    id: 'blog-id',
    title: 'English title',
    slug: 'english-title',
    excerpt: 'English excerpt',
    content: '<p>English content</p>',
    coverImageKey: 'images/cover.webp',
    coverImageUrl: 'https://bucket.example.com/images/cover.webp',
    language: Language.EN,
    status: BlogStatus.DRAFT,
    isFeatured: false,
    publishedAt: null,
    createdAt: new Date('2026-08-08T10:00:00.000Z'),
    updatedAt: new Date('2026-08-08T10:00:00.000Z'),
    translations: [
      {
        id: 'translation-en',
        language: Language.EN,
        title: 'English title',
        slug: 'english-title',
        excerpt: 'English excerpt',
        content: '<p>English content</p>',
        metaTitle: null,
        metaDescription: null,
      },
      {
        id: 'translation-ka',
        language: Language.KA,
        title: 'Georgian title',
        slug: 'georgian-title',
        excerpt: 'Georgian excerpt',
        content: '<p>Georgian content</p>',
        metaTitle: null,
        metaDescription: null,
      },
    ],
  };

  let tx: {
    blog: {
      delete: jest.Mock<Promise<typeof deletedBlog>, [unknown]>;
    };
    adminLog: {
      create: jest.Mock<Promise<unknown>, [unknown]>;
    };
  };
  let prismaService: {
    $transaction: jest.Mock<
      Promise<{ blog: typeof deletedBlog; message: string }>,
      [
        callback: (
          tx: typeof tx,
        ) => Promise<{ blog: typeof deletedBlog; message: string }>,
      ]
    >;
  };
  let service: BlogsService;

  beforeEach(() => {
    tx = {
      blog: {
        delete: jest
          .fn<Promise<typeof deletedBlog>, [unknown]>()
          .mockResolvedValue(deletedBlog),
      },
      adminLog: {
        create: jest
          .fn<Promise<unknown>, [unknown]>()
          .mockResolvedValue({ id: 'log-id' }),
      },
    };
    prismaService = {
      $transaction: jest
        .fn<
          Promise<{ blog: typeof deletedBlog; message: string }>,
          [
            callback: (
              tx: typeof tx,
            ) => Promise<{ blog: typeof deletedBlog; message: string }>,
          ]
        >()
        .mockImplementation((callback) => callback(tx)),
    };
    service = new BlogsService(prismaService as unknown as PrismaService);
  });

  it('deletes the blog in a transaction and records an admin log', async () => {
    await expect(service.remove(deletedBlog.id, adminId)).resolves.toEqual({
      blog: deletedBlog,
      message: 'Blog deleted successfully',
    });

    expect(tx.blog.delete).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: deletedBlog.id },
      }),
    );
    expect(tx.adminLog.create).toHaveBeenCalledWith({
      data: {
        userId: adminId,
        action: AdminAction.DELETE,
        entity: AdminEntity.BLOG,
        entityId: deletedBlog.id,
      },
    });
  });
});
