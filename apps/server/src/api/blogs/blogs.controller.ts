import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { UserRole } from '@prisma/client';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  BlogResponseDto,
  BlogsResponseDto,
  DeleteBlogResponseDto,
} from './dto/blog-response.dto';
import { CreateBlogDto } from './dto/create-blog.dto';
import { FindBlogsQueryDto } from './dto/find-blogs-query.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import {
  BlogViewCountResponse,
  BlogDetail,
  BlogsService,
  DeleteBlogResponse,
  FindBlogsResponse,
} from './blogs.service';

@ApiTags('blogs')
@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get publicly available published blogs' })
  @ApiOkResponse({ type: BlogsResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid query parameters.' })
  public findPublicBlogs(
    @Query() query: FindBlogsQueryDto,
  ): Promise<FindBlogsResponse> {
    return this.blogsService.findPublic(query);
  }

  @Get('admin')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get blogs for admin users, including drafts' })
  @ApiOkResponse({ type: BlogsResponseDto })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiForbiddenResponse({ description: 'Admin access is required.' })
  public findAdminBlogs(
    @Query() query: FindBlogsQueryDto,
  ): Promise<FindBlogsResponse> {
    return this.blogsService.findAdmin(query);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get publicly available blog by slug' })
  @ApiParam({ name: 'slug', example: 'fire-safety-checklist' })
  @ApiOkResponse({ type: BlogResponseDto })
  @ApiNotFoundResponse({ description: 'Blog not found.' })
  public findPublicBySlug(@Param('slug') slug: string): Promise<BlogDetail> {
    return this.blogsService.findPublicBySlug(slug);
  }

  @Post('public/:slug/view')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Record a public blog detail page view by localized slug',
    description:
      'Applies route-specific in-memory throttling only; session-level deduplication is handled by the public client.',
  })
  @ApiParam({ name: 'slug', example: 'fire-safety-checklist' })
  @ApiOkResponse({
    schema: {
      example: {
        viewCount: 15,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Blog not found.' })
  public incrementPublicViewCount(
    @Param('slug') slug: string,
  ): Promise<BlogViewCountResponse> {
    return this.blogsService.incrementViewCount(slug);
  }

  @Post('slug/:slug/view')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: 'Increment blog view count by slug' })
  @ApiParam({ name: 'slug', example: 'fire-safety-checklist' })
  @ApiOkResponse({
    schema: {
      example: {
        viewCount: 15,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Blog not found.' })
  public incrementViewCount(
    @Param('slug') slug: string,
  ): Promise<BlogViewCountResponse> {
    return this.blogsService.incrementViewCount(slug);
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get complete blog by ID for admin users' })
  @ApiParam({ name: 'id', example: 'ab5a4c0f-7e19-42c3-8b95-905599b46c25' })
  @ApiOkResponse({ type: BlogResponseDto })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiForbiddenResponse({ description: 'Admin access is required.' })
  @ApiNotFoundResponse({ description: 'Blog not found.' })
  public findOne(@Param('id', ParseUUIDPipe) id: string): Promise<BlogDetail> {
    return this.blogsService.findOne(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create blog' })
  @ApiBody({ type: CreateBlogDto })
  @ApiCreatedResponse({ type: BlogResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid blog payload.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiForbiddenResponse({
    description: 'Only SUPER_ADMIN and ADMIN users can create blogs.',
  })
  @ApiConflictResponse({ description: 'Blog with this slug already exists.' })
  public create(
    @Body() createBlogDto: CreateBlogDto,
    @ActiveUser('id') adminId: string,
  ): Promise<BlogDetail> {
    return this.blogsService.create(createBlogDto, adminId);
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update blog' })
  @ApiParam({ name: 'id', example: 'ab5a4c0f-7e19-42c3-8b95-905599b46c25' })
  @ApiBody({ type: UpdateBlogDto })
  @ApiOkResponse({ type: BlogResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid blog payload.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiForbiddenResponse({
    description: 'Only SUPER_ADMIN and ADMIN users can update blogs.',
  })
  @ApiNotFoundResponse({ description: 'Blog not found.' })
  @ApiConflictResponse({ description: 'Blog with this slug already exists.' })
  public update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBlogDto: UpdateBlogDto,
    @ActiveUser('id') adminId: string,
  ): Promise<BlogDetail> {
    return this.blogsService.update(id, updateBlogDto, adminId);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete blog' })
  @ApiParam({ name: 'id', example: 'ab5a4c0f-7e19-42c3-8b95-905599b46c25' })
  @ApiOkResponse({ type: DeleteBlogResponseDto })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiForbiddenResponse({
    description: 'Only SUPER_ADMIN and ADMIN users can delete blogs.',
  })
  @ApiNotFoundResponse({ description: 'Blog not found.' })
  public remove(
    @Param('id', ParseUUIDPipe) id: string,
    @ActiveUser('id') adminId: string,
  ): Promise<DeleteBlogResponse> {
    return this.blogsService.remove(id, adminId);
  }
}
