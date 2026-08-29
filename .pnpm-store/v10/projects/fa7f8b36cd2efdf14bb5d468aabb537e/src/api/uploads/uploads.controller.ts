import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Post,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import multer from 'multer';
import { Roles } from '../auth/decorators/roles.decorator';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { DeleteImageDto } from './dto/delete-image.dto';
import { DeleteImageResponseDto } from './dto/delete-image-response.dto';
import { UploadImageResponseDto } from './dto/upload-image-response.dto';
import { UploadExceptionFilter } from './filters/upload-exception.filter';
import {
  DeleteImageResponse,
  StorageService,
  UploadImageResponse,
} from './storage.service';

const MAX_IMAGE_SIZE_IN_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

@ApiTags('uploads')
@ApiBearerAuth('access-token')
@Controller('uploads')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class UploadsController {
  constructor(private readonly storageService: StorageService) {}

  @Post('image')
  @UseFilters(UploadExceptionFilter)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: multer.memoryStorage(),
      limits: {
        fileSize: MAX_IMAGE_SIZE_IN_BYTES,
        files: 1,
      },
      fileFilter: (_request, file, callback) => {
        if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
          callback(
            new BadRequestException(
              'Only JPEG, PNG, and WebP images are allowed',
            ),
            false,
          );
          return;
        }

        callback(null, true);
      },
    }),
  )
  @ApiOperation({ summary: 'Upload image to Hetzner Object Storage' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['image'],
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'JPEG, PNG, or WebP image. Maximum size: 5 MB.',
        },
      },
    },
  })
  @ApiCreatedResponse({ type: UploadImageResponseDto })
  @ApiBadRequestResponse({
    description: 'Missing file, invalid image type, or file larger than 5 MB.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiForbiddenResponse({
    description: 'Only SUPER_ADMIN and ADMIN users can upload images.',
  })
  @ApiInternalServerErrorResponse({ description: 'Could not upload image.' })
  public uploadImage(
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<UploadImageResponse> {
    return this.storageService.uploadImage(file);
  }

  @Delete('image')
  @ApiOperation({ summary: 'Delete image from Hetzner Object Storage' })
  @ApiBody({ type: DeleteImageDto })
  @ApiOkResponse({ type: DeleteImageResponseDto })
  @ApiBadRequestResponse({
    description: 'Image key is missing or does not belong to images/.',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiForbiddenResponse({
    description: 'Only SUPER_ADMIN and ADMIN users can delete images.',
  })
  @ApiInternalServerErrorResponse({ description: 'Could not delete image.' })
  public deleteImage(
    @Body() deleteImageDto: DeleteImageDto,
  ): Promise<DeleteImageResponse> {
    return this.storageService.deleteImage(deleteImageDto.key);
  }
}
