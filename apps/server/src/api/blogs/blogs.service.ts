import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  AdminAction,
  AdminEntity,
  BlogStatus,
  Language,
  Prisma,
} from '@prisma/client';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { FindBlogsQueryDto } from './dto/find-blogs-query.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogSortBy, BlogSortOrder } from './enums/blog-sort-by.enum';
import {
  assertBlogHtmlHasVisibleText,
  sanitizeBlogHtml,
} from './lib/blog-html.util';
import { normalizeBlogSlug } from './lib/blog-slug.util';

const blogListSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  coverImageKey: true,
  coverImageUrl: true,
  language: true,
  status: true,
  isFeatured: true,
  viewCount: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  translations: {
    select: {
      id: true,
      language: true,
      title: true,
      slug: true,
      excerpt: true,
      metaTitle: true,
      metaDescription: true,
    },
    orderBy: {
      language: 'asc',
    },
  },
} satisfies Prisma.BlogSelect;

const blogDetailSelect = {
  ...blogListSelect,
  content: true,
  translations: {
    select: {
      id: true,
      language: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      metaTitle: true,
      metaDescription: true,
    },
    orderBy: {
      language: 'asc',
    },
  },
} satisfies Prisma.BlogSelect;

export type BlogListItem = Prisma.BlogGetPayload<{
  select: typeof blogListSelect;
}>;

export type BlogDetail = Prisma.BlogGetPayload<{
  select: typeof blogDetailSelect;
}>;

export type BlogsPagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

export type FindBlogsResponse = {
  data: BlogListItem[];
  pagination: BlogsPagination;
};

export type DeleteBlogResponse = {
  blog: BlogDetail;
  message: string;
};

export type BlogViewCountResponse = {
  viewCount: number;
};

const isPrismaKnownError = (
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError => {
  return error instanceof Prisma.PrismaClientKnownRequestError;
};

const BLOG_SLUG_MAX_LENGTH = 120;

@Injectable()
export class BlogsService {
  private readonly logger = new Logger(BlogsService.name);

  constructor(private readonly prismaService: PrismaService) {}

  public async create(
    createBlogDto: CreateBlogDto,
    adminId: string,
  ): Promise<BlogDetail> {
    const translations = this.normalizeAndValidateCreateTranslations(
      createBlogDto.translations,
    );
    const defaultTranslation =
      translations.find(
        (translation) => translation.language === Language.EN,
      ) ?? translations[0];
    const publishedAt = this.resolveCreatePublishedAt(createBlogDto);

    try {
      return await this.prismaService.$transaction(async (tx) => {
        const blog = await tx.blog.create({
          data: {
            title: defaultTranslation.title,
            slug: defaultTranslation.slug,
            excerpt: defaultTranslation.excerpt,
            content: defaultTranslation.content,
            coverImageKey: createBlogDto.coverImageKey.trim(),
            coverImageUrl: createBlogDto.coverImageUrl.trim(),
            language: defaultTranslation.language,
            status: createBlogDto.status,
            isFeatured: createBlogDto.isFeatured ?? false,
            publishedAt,
            translations: {
              create: translations.map((translation) => ({
                language: translation.language,
                title: translation.title,
                slug: translation.slug,
                excerpt: translation.excerpt,
                content: translation.content,
                metaTitle: translation.metaTitle,
                metaDescription: translation.metaDescription,
              })),
            },
          },
          select: blogDetailSelect,
        });

        await tx.adminLog.create({
          data: {
            userId: adminId,
            action: AdminAction.CREATE,
            entity: AdminEntity.BLOG,
            entityId: blog.id,
          },
        });

        return blog;
      });
    } catch (error: unknown) {
      if (isPrismaKnownError(error) && error.code === 'P2002') {
        throw new ConflictException('Blog with this slug already exists');
      }

      this.logBlogPersistenceError('create', error);

      throw new InternalServerErrorException('Could not create blog');
    }
  }

  public async findPublic(
    query: FindBlogsQueryDto,
  ): Promise<FindBlogsResponse> {
    return this.findMany(query, {
      status: BlogStatus.PUBLISHED,
      publishedAt: {
        lte: new Date(),
      },
    });
  }

  public async findAdmin(query: FindBlogsQueryDto): Promise<FindBlogsResponse> {
    return this.findMany(query, {});
  }

  public async findOne(id: string): Promise<BlogDetail> {
    try {
      const blog = await this.prismaService.blog.findUnique({
        where: {
          id,
        },
        select: blogDetailSelect,
      });

      if (!blog) {
        throw new NotFoundException('Blog not found');
      }

      return blog;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Could not fetch blog');
    }
  }

  public async findPublicBySlug(slug: string): Promise<BlogDetail> {
    const normalizedSlug = this.normalizeAndValidateSlug(slug);

    try {
      const blog = await this.prismaService.blog.findFirst({
        where: {
          slug: normalizedSlug,
          status: BlogStatus.PUBLISHED,
          publishedAt: {
            lte: new Date(),
          },
        },
        select: blogDetailSelect,
      });

      if (!blog) {
        throw new NotFoundException('Blog not found');
      }

      return blog;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Could not fetch blog');
    }
  }

  public async incrementViewCount(
    slug: string,
  ): Promise<BlogViewCountResponse> {
    const normalizedSlug = this.normalizeAndValidateSlug(slug);

    try {
      const blog = await this.prismaService.blog.update({
        where: {
          slug: normalizedSlug,
        },
        data: {
          viewCount: {
            increment: 1,
          },
        },
        select: {
          viewCount: true,
        },
      });

      return blog;
    } catch (error: unknown) {
      if (isPrismaKnownError(error) && error.code === 'P2025') {
        throw new NotFoundException('Blog not found');
      }

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Could not increment blog view count',
      );
    }
  }

  public async update(
    id: string,
    updateBlogDto: UpdateBlogDto,
    adminId: string,
  ): Promise<BlogDetail> {
    if (!Object.keys(updateBlogDto).length) {
      throw new BadRequestException('No blog fields provided for update');
    }

    if (
      this.hasLocalizedRootFields(updateBlogDto) &&
      !updateBlogDto.translations
    ) {
      throw new BadRequestException(
        'Blog update must include both KA and EN translations',
      );
    }

    try {
      return await this.prismaService.$transaction(async (tx) => {
        const existingBlog = await tx.blog.findUnique({
          where: {
            id,
          },
          select: {
            id: true,
            status: true,
            publishedAt: true,
            translations: {
              select: {
                language: true,
              },
            },
          },
        });

        if (!existingBlog) {
          throw new NotFoundException('Blog not found');
        }

        this.assertExistingBlogHasRequiredTranslations(
          existingBlog.translations,
        );

        const translations = updateBlogDto.translations
          ? this.normalizeAndValidateUpdateTranslations(
              updateBlogDto.translations,
            )
          : undefined;
        const data = this.buildUpdateData(
          updateBlogDto,
          existingBlog,
          translations,
        );

        const blog = await tx.blog.update({
          where: {
            id,
          },
          data,
          select: blogDetailSelect,
        });

        if (translations) {
          await Promise.all(
            translations.map((translation) =>
              tx.blogTranslation.update({
                where: {
                  blogId_language: {
                    blogId: id,
                    language: translation.language,
                  },
                },
                data: {
                  title: translation.title,
                  slug: translation.slug,
                  excerpt: translation.excerpt,
                  content: translation.content,
                  metaTitle: translation.metaTitle,
                  metaDescription: translation.metaDescription,
                },
              }),
            ),
          );
        }

        await tx.adminLog.create({
          data: {
            userId: adminId,
            action: AdminAction.UPDATE,
            entity: AdminEntity.BLOG,
            entityId: blog.id,
          },
        });

        return (
          (await tx.blog.findUnique({
            where: {
              id,
            },
            select: blogDetailSelect,
          })) ?? blog
        );
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (isPrismaKnownError(error) && error.code === 'P2002') {
        throw new ConflictException('Blog with this slug already exists');
      }

      if (isPrismaKnownError(error) && error.code === 'P2025') {
        throw new NotFoundException('Blog not found');
      }

      throw new InternalServerErrorException('Could not update blog');
    }
  }

  public async remove(
    id: string,
    adminId: string,
  ): Promise<DeleteBlogResponse> {
    try {
      return await this.prismaService.$transaction(async (tx) => {
        const blog = await tx.blog.delete({
          where: {
            id,
          },
          select: blogDetailSelect,
        });

        await tx.adminLog.create({
          data: {
            userId: adminId,
            action: AdminAction.DELETE,
            entity: AdminEntity.BLOG,
            entityId: blog.id,
          },
        });

        return {
          blog,
          message: 'Blog deleted successfully',
        };
      });
    } catch (error: unknown) {
      if (isPrismaKnownError(error) && error.code === 'P2025') {
        throw new NotFoundException('Blog not found');
      }

      throw new InternalServerErrorException('Could not delete blog');
    }
  }

  private async findMany(
    query: FindBlogsQueryDto,
    baseWhere: Prisma.BlogWhereInput,
  ): Promise<FindBlogsResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where = this.buildWhere(query, baseWhere);

    try {
      const [data, totalItems] = await this.prismaService.$transaction([
        this.prismaService.blog.findMany({
          where,
          select: blogListSelect,
          orderBy: this.buildOrderBy(query),
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prismaService.blog.count({
          where,
        }),
      ]);

      return {
        data,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
        },
      };
    } catch {
      throw new InternalServerErrorException('Could not fetch blogs');
    }
  }

  private buildWhere(
    query: FindBlogsQueryDto,
    baseWhere: Prisma.BlogWhereInput,
  ): Prisma.BlogWhereInput {
    const where: Prisma.BlogWhereInput = {
      ...baseWhere,
    };
    const search = query.search?.trim();

    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (query.language) {
      where.language = query.language;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.isFeatured !== undefined) {
      where.isFeatured = query.isFeatured;
    }

    return where;
  }

  private buildOrderBy(
    query: FindBlogsQueryDto,
  ): Prisma.BlogOrderByWithRelationInput {
    const sortBy = query.sortBy ?? BlogSortBy.CREATED_AT;
    const sortOrder = query.sortOrder ?? BlogSortOrder.DESC;

    if (sortBy === BlogSortBy.PUBLISHED_AT) {
      return {
        publishedAt: sortOrder,
      };
    }

    return {
      createdAt: sortOrder,
    };
  }

  private buildUpdateData(
    updateBlogDto: UpdateBlogDto,
    existingBlog: { status: BlogStatus; publishedAt: Date | null },
    translations:
      | Array<{
          language: Language;
          title: string;
          slug: string;
          excerpt: string;
          content: string;
          metaTitle: string | null;
          metaDescription: string | null;
        }>
      | undefined,
  ): Prisma.BlogUpdateInput {
    const data: Prisma.BlogUpdateInput = {};
    const defaultTranslation = translations?.find(
      (translation) => translation.language === Language.EN,
    );

    if (defaultTranslation) {
      data.title = defaultTranslation.title;
      data.slug = defaultTranslation.slug;
      data.excerpt = defaultTranslation.excerpt;
      data.content = defaultTranslation.content;
      data.language = defaultTranslation.language;
    }

    if (updateBlogDto.coverImageKey !== undefined) {
      data.coverImageKey = updateBlogDto.coverImageKey.trim();
    }

    if (updateBlogDto.coverImageUrl !== undefined) {
      data.coverImageUrl = updateBlogDto.coverImageUrl.trim();
    }

    if (updateBlogDto.language !== undefined) {
      data.language = updateBlogDto.language;
    }

    if (updateBlogDto.isFeatured !== undefined) {
      data.isFeatured = updateBlogDto.isFeatured;
    }

    this.applyPublicationUpdate(data, updateBlogDto, existingBlog);

    return data;
  }

  private applyPublicationUpdate(
    data: Prisma.BlogUpdateInput,
    updateBlogDto: UpdateBlogDto,
    existingBlog: { status: BlogStatus; publishedAt: Date | null },
  ): void {
    if (updateBlogDto.status === BlogStatus.DRAFT) {
      data.status = BlogStatus.DRAFT;
      data.publishedAt = null;
      return;
    }

    if (updateBlogDto.status === BlogStatus.PUBLISHED) {
      data.status = BlogStatus.PUBLISHED;
      data.publishedAt =
        updateBlogDto.publishedAt ?? existingBlog.publishedAt ?? new Date();
      return;
    }

    if (
      updateBlogDto.publishedAt !== undefined &&
      existingBlog.status === BlogStatus.PUBLISHED
    ) {
      data.publishedAt = updateBlogDto.publishedAt;
    }
  }

  private resolveCreatePublishedAt(createBlogDto: CreateBlogDto): Date | null {
    if (createBlogDto.status === BlogStatus.PUBLISHED) {
      return createBlogDto.publishedAt ?? new Date();
    }

    return null;
  }

  private normalizeAndValidateCreateTranslations(
    translations: CreateBlogDto['translations'],
  ): Array<{
    language: Language;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    metaTitle: string | null;
    metaDescription: string | null;
  }> {
    const requiredLanguages = [Language.KA, Language.EN];
    const providedLanguages = new Set(
      translations.map((translation) => translation.language),
    );
    const hasRequiredTranslations =
      translations.length === requiredLanguages.length &&
      requiredLanguages.every((language) => providedLanguages.has(language));

    if (!hasRequiredTranslations) {
      throw new BadRequestException(
        'Blog must include exactly one KA and one EN translation',
      );
    }

    const normalizedTranslations = translations.map((translation) => ({
      language: translation.language,
      title: translation.title.trim(),
      slug: this.normalizeAndValidateSlug(translation.slug),
      excerpt: translation.excerpt.trim(),
      content: this.sanitizeAndValidateContent(translation.content),
      metaTitle: this.normalizeOptionalText(translation.metaTitle),
      metaDescription: this.normalizeOptionalText(translation.metaDescription),
    }));

    this.assertCreateTranslationsUseEnglishCanonicalSlug(
      normalizedTranslations,
    );

    return normalizedTranslations;
  }

  private normalizeAndValidateUpdateTranslations(
    translations: NonNullable<UpdateBlogDto['translations']>,
  ): Array<{
    language: Language;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    metaTitle: string | null;
    metaDescription: string | null;
  }> {
    return this.normalizeAndValidateTranslations(translations);
  }

  private normalizeAndValidateTranslations(
    translations: Array<{
      language: Language;
      title: string;
      slug: string;
      excerpt: string;
      content: string;
      metaTitle?: string;
      metaDescription?: string;
    }>,
  ): Array<{
    language: Language;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    metaTitle: string | null;
    metaDescription: string | null;
  }> {
    const requiredLanguages = [Language.KA, Language.EN];
    const providedLanguages = new Set(
      translations.map((translation) => translation.language),
    );
    const hasRequiredTranslations =
      translations.length === requiredLanguages.length &&
      requiredLanguages.every((language) => providedLanguages.has(language));

    if (!hasRequiredTranslations) {
      throw new BadRequestException(
        'Blog must include exactly one KA and one EN translation',
      );
    }

    return translations.map((translation) => ({
      language: translation.language,
      title: translation.title.trim(),
      slug: this.normalizeAndValidateSlug(translation.slug),
      excerpt: translation.excerpt.trim(),
      content: this.sanitizeAndValidateContent(translation.content),
      metaTitle: this.normalizeOptionalText(translation.metaTitle),
      metaDescription: this.normalizeOptionalText(translation.metaDescription),
    }));
  }

  private hasLocalizedRootFields(updateBlogDto: UpdateBlogDto): boolean {
    return (
      updateBlogDto.title !== undefined ||
      updateBlogDto.slug !== undefined ||
      updateBlogDto.excerpt !== undefined ||
      updateBlogDto.content !== undefined ||
      updateBlogDto.language !== undefined
    );
  }

  private assertExistingBlogHasRequiredTranslations(
    translations: Array<{ language: Language }>,
  ): void {
    const providedLanguages = new Set(
      translations.map((translation) => translation.language),
    );

    if (
      !providedLanguages.has(Language.KA) ||
      !providedLanguages.has(Language.EN)
    ) {
      throw new BadRequestException(
        'Blog must include exactly one KA and one EN translation',
      );
    }
  }

  private normalizeOptionalText(value: string | undefined): string | null {
    if (value === undefined) {
      return null;
    }

    const normalizedValue = value.trim();

    return normalizedValue.length > 0 ? normalizedValue : null;
  }

  private normalizeAndValidateSlug(slug: string): string {
    const normalizedSlug = normalizeBlogSlug(slug);

    if (!normalizedSlug) {
      throw new BadRequestException('Slug is required');
    }

    if (normalizedSlug.length > BLOG_SLUG_MAX_LENGTH) {
      throw new BadRequestException(
        `Slug must be ${BLOG_SLUG_MAX_LENGTH} characters or fewer`,
      );
    }

    return normalizedSlug;
  }

  private assertCreateTranslationsUseEnglishCanonicalSlug(
    translations: Array<{ language: Language; slug: string }>,
  ): void {
    const englishTranslation = translations.find(
      (translation) => translation.language === Language.EN,
    );
    const canonicalSlug = englishTranslation?.slug;

    if (
      !canonicalSlug ||
      translations.some((translation) => translation.slug !== canonicalSlug)
    ) {
      throw new BadRequestException(
        'Blog translations must use the same English canonical slug',
      );
    }
  }

  private sanitizeAndValidateContent(content: string): string {
    const sanitizedContent = sanitizeBlogHtml(content);

    assertBlogHtmlHasVisibleText(sanitizedContent);

    return sanitizedContent;
  }

  private logBlogPersistenceError(action: 'create', error: unknown): void {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : undefined;

    this.logger.error(`Blog ${action} failed: ${message}`, stack);
  }
}
