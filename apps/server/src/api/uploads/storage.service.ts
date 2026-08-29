import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

const IMAGE_PREFIX = 'images/';
const MAX_IMAGE_SIZE_IN_BYTES = 5 * 1024 * 1024;

const imageMimeTypeToExtension = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const;

type AllowedImageMimeType = keyof typeof imageMimeTypeToExtension;

export type UploadImageResponse = {
  key: string;
  url: string;
};

export type DeleteImageResponse = {
  success: boolean;
  message: string;
};

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly endpoint: string;
  private readonly region: string;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.endpoint = this.configService.getOrThrow<string>(
      'appConfig.hetznerS3.endpoint',
    );
    this.region = this.configService.getOrThrow<string>(
      'appConfig.hetznerS3.region',
    );
    this.bucket = this.configService.getOrThrow<string>(
      'appConfig.hetznerS3.bucket',
    );

    const accessKeyId = this.configService.getOrThrow<string>(
      'appConfig.hetznerS3.accessKey',
    );
    const secretAccessKey = this.configService.getOrThrow<string>(
      'appConfig.hetznerS3.secretKey',
    );

    this.s3Client = new S3Client({
      endpoint: this.endpoint,
      region: this.region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  public async uploadImage(
    file: Express.Multer.File | undefined,
  ): Promise<UploadImageResponse> {
    this.validateImageFile(file);

    const extension = this.getExtensionFromMimeType(file.mimetype);
    const key = `${IMAGE_PREFIX}${randomUUID()}.${extension}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      return {
        key,
        url: this.buildPublicUrl(key),
      };
    } catch (error: unknown) {
      this.logStorageError('upload', key, error);

      throw new InternalServerErrorException('Could not upload image');
    }
  }

  public async deleteImage(key: string): Promise<DeleteImageResponse> {
    const normalizedKey = key.trim();

    if (!normalizedKey.startsWith(IMAGE_PREFIX)) {
      throw new BadRequestException('Image key must start with images/');
    }

    if (normalizedKey.includes('..') || normalizedKey.includes('\\')) {
      throw new BadRequestException('Invalid image key');
    }

    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: normalizedKey,
        }),
      );

      return {
        success: true,
        message: 'Image deleted successfully',
      };
    } catch (error: unknown) {
      this.logStorageError('delete', normalizedKey, error);

      throw new InternalServerErrorException('Could not delete image');
    }
  }

  private validateImageFile(
    file: Express.Multer.File | undefined,
  ): asserts file is Express.Multer.File {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    if (file.size > MAX_IMAGE_SIZE_IN_BYTES) {
      throw new BadRequestException('Image file size must not exceed 5 MB');
    }

    if (!this.isAllowedImageMimeType(file.mimetype)) {
      throw new BadRequestException(
        'Only JPEG, PNG, and WebP images are allowed',
      );
    }

    if (!this.hasExpectedImageSignature(file.buffer, file.mimetype)) {
      throw new BadRequestException(
        'Image file content does not match its type',
      );
    }
  }

  private getExtensionFromMimeType(mimetype: string): string {
    if (!this.isAllowedImageMimeType(mimetype)) {
      throw new BadRequestException(
        'Only JPEG, PNG, and WebP images are allowed',
      );
    }

    return imageMimeTypeToExtension[mimetype];
  }

  private isAllowedImageMimeType(
    mimetype: string,
  ): mimetype is AllowedImageMimeType {
    return mimetype in imageMimeTypeToExtension;
  }

  private hasExpectedImageSignature(
    buffer: Buffer,
    mimetype: AllowedImageMimeType,
  ): boolean {
    if (mimetype === 'image/jpeg') {
      return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8;
    }

    if (mimetype === 'image/png') {
      const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

      return pngSignature.every((byte, index) => buffer[index] === byte);
    }

    return (
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    );
  }

  private buildPublicUrl(key: string): string {
    return `https://${this.bucket}.${this.region}.your-objectstorage.com/${key}`;
  }

  private logStorageError(
    action: 'upload' | 'delete',
    key: string,
    error: unknown,
  ) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : undefined;

    this.logger.error(
      `Object storage ${action} failed for bucket=${this.bucket}, key=${key}: ${message}`,
      stack,
    );
  }
}
