import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AdminAction, AdminEntity, BlogStatus, Prisma } from '@prisma/client';
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
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.BlogSelect;

const blogDetailSelect = {
  ...blogListSelect,
  content: true,
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

const isPrismaKnownError = (
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError => {
  return error instanceof Prisma.PrismaClientKnownRequestError;
};

@Injectable()
export class BlogsService {
  private readonly logger = new Logger(BlogsService.name);

  constructor(private readonly prismaService: PrismaService) {}

  public async create(
    createBlogDto: CreateBlogDto,
    adminId: string,
  ): Promise<BlogDetail> {
    const slug = this.normalizeAndValidateSlug(createBlogDto.slug);
    const content = this.sanitizeAndValidateContent(createBlogDto.content);
    const publishedAt = this.resolveCreatePublishedAt(createBlogDto);

    try {
      return await this.prismaService.$transaction(async (tx) => {
        const blog = await tx.blog.create({
          data: {
            title: createBlogDto.title.trim(),
            slug,
            excerpt: createBlogDto.excerpt.trim(),
            content,
            coverImageKey: createBlogDto.coverImageKey.trim(),
            coverImageUrl: createBlogDto.coverImageUrl.trim(),
            language: createBlogDto.language,
            status: createBlogDto.status,
            isFeatured: createBlogDto.isFeatured ?? false,
            publishedAt,
          },
          select: blogDetailSelect,
        });

        await tx.adminLog.create({
          data: {
            userId: adminId,
            action:
              blog.status === BlogStatus.PUBLISHED
                ? AdminAction.PUBLISH
                : AdminAction.CREATE,
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

  public async update(
    id: string,
    updateBlogDto: UpdateBlogDto,
    adminId: string,
  ): Promise<BlogDetail> {
    if (!Object.keys(updateBlogDto).length) {
      throw new BadRequestException('No blog fields provided for update');
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
          },
        });

        if (!existingBlog) {
          throw new NotFoundException('Blog not found');
        }

        const data = this.buildUpdateData(updateBlogDto, existingBlog);
        const blog = await tx.blog.update({
          where: {
            id,
          },
          data,
          select: blogDetailSelect,
        });

        await tx.adminLog.create({
          data: {
            userId: adminId,
            action: this.resolveUpdateAdminAction(
              existingBlog.status,
              blog.status,
            ),
            entity: AdminEntity.BLOG,
            entityId: blog.id,
          },
        });

        return blog;
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
  ): Prisma.BlogUpdateInput {
    const data: Prisma.BlogUpdateInput = {};

    if (updateBlogDto.title !== undefined) {
      data.title = updateBlogDto.title.trim();
    }

    if (updateBlogDto.slug !== undefined) {
      data.slug = this.normalizeAndValidateSlug(updateBlogDto.slug);
    }

    if (updateBlogDto.excerpt !== undefined) {
      data.excerpt = updateBlogDto.excerpt.trim();
    }

    if (updateBlogDto.content !== undefined) {
      data.content = this.sanitizeAndValidateContent(updateBlogDto.content);
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

  private resolveUpdateAdminAction(
    previousStatus: BlogStatus,
    nextStatus: BlogStatus,
  ): AdminAction {
    if (
      previousStatus !== BlogStatus.PUBLISHED &&
      nextStatus === BlogStatus.PUBLISHED
    ) {
      return AdminAction.PUBLISH;
    }

    if (
      previousStatus === BlogStatus.PUBLISHED &&
      nextStatus !== BlogStatus.PUBLISHED
    ) {
      return AdminAction.UNPUBLISH;
    }

    return AdminAction.UPDATE;
  }

  private normalizeAndValidateSlug(slug: string): string {
    const normalizedSlug = normalizeBlogSlug(slug);

    if (!normalizedSlug) {
      throw new BadRequestException('Slug is required');
    }

    return normalizedSlug;
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
