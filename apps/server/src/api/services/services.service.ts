import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { Language, Prisma } from '@prisma/client';
import { ServiceLanguage } from './enums/service-language';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async incrementViewCount(id: string): Promise<{ viewCount: number }> {
    try {
      const service = await this.prisma.service.update({
        where: {
          id,
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

      return service;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Service not found');
      }

      throw new InternalServerErrorException(
        'Could not increment service view count',
      );
    }
  }

  async create(createServiceDto: CreateServiceDto) {
    const dto = createServiceDto as unknown as Record<string, any>;

    if (!dto.title) throw new Error('Title is required');
    if (!dto.description) throw new Error('Description is required');
    if (!dto.language) throw new Error('Language is required');
    if (!dto.icon) throw new Error('Icon is required');
    if (!dto.iconColor) throw new Error('Icon color is required');

    const data = {
      title: dto.title,
      description: dto.description,
      language: dto.language,
      service: {
        create: {
          icon: dto.icon,
          iconColor: dto.iconColor,
        },
      },
    };

    try {
      const services = await this.prisma.serviceTranslation.create({
        data: data,
      });
      return services;
    } catch (error) {
      throw error;
    }
  }

  async findAll(language?: ServiceLanguage) {
    const where: Prisma.ServiceTranslationWhereInput = language
      ? {
          language: language,
        }
      : {};

    try {
      const services = await this.prisma.serviceTranslation.findMany({
        include: {
          service: {
            select: {
              icon: true,
              iconColor: true,
            },
          },
        },

        where,
      });
      return services;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const service = await this.prisma.serviceTranslation.findUnique({
        where: {
          id: id,
        },
      });

      return service;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    const dto = updateServiceDto as unknown as Record<string, any>;
    const data: Record<string, any> = {};

    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.language !== undefined) data.language = dto.language;

    if (dto.icon !== undefined || dto.iconColor !== undefined) {
      data.service = { update: {} };
      if (dto.icon !== undefined) data.service.update.icon = dto.icon;
      if (dto.iconColor !== undefined)
        data.service.update.iconColor = dto.iconColor;
    }

    try {
      const service = await this.prisma.serviceTranslation.update({
        where: {
          id: id,
        },
        data: data as any,
      });

      return service;
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const service = await this.prisma.serviceTranslation.delete({
        where: {
          id: id,
        },
      });

      return { service, message: 'Service deleted successfully' };
    } catch (error) {
      throw error;
    }
  }
}
