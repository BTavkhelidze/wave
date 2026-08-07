import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { CreateServiceTranslationDto } from './dto/create-service-translation.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { AdminAction, AdminEntity, Language, Prisma } from '@prisma/client';
import { ServiceLanguage } from './enums/service-language';

export interface PublicServiceResponse {
  id: string;
  title_ka?: string;
  title_en?: string;
  description_ka?: string;
  description_en?: string;
  icon: string;
  iconColor: string;
  colors: string[];
}

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

  async create(createServiceDto: CreateServiceDto, adminId: string) {
    const requiredLanguages = [ServiceLanguage.EN, ServiceLanguage.KA];
    const providedLanguages = new Set(
      createServiceDto.translations.map((translation) => translation.language),
    );
    const hasRequiredTranslations =
      createServiceDto.translations.length === requiredLanguages.length &&
      requiredLanguages.every((language) => providedLanguages.has(language));

    if (!hasRequiredTranslations) {
      throw new BadRequestException(
        'Service must include exactly one EN and one KA translation',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const serviceCount = await tx.service.count({
        where: {
          deletedAt: null,
        },
      });
      const service = await tx.service.create({
        data: {
          icon: createServiceDto.icon,
          iconColor: createServiceDto.iconColor,
          sortOrder: serviceCount + 1,
          translations: {
            create: createServiceDto.translations.map((translation) => ({
              language: translation.language,
              title: translation.title,
              description: translation.description,
            })),
          },
        },
        include: {
          translations: true,
        },
      });

      await tx.adminLog.create({
        data: {
          userId: adminId,
          action: AdminAction.CREATE,
          entity: AdminEntity.SERVICE,
          entityId: service.id,
        },
      });

      return service;
    });
  }

  async findAll(language?: ServiceLanguage) {
    const translationWhere: Prisma.ServiceTranslationWhereInput = language
      ? {
          language,
        }
      : {};

    const services = await this.prisma.service.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        icon: true,
        iconColor: true,
        sortOrder: true,
        createdAt: true,
        translations: {
          where: translationWhere,
          orderBy: {
            language: 'asc',
          },
        },
      },
    });

    return services.flatMap((service) =>
      service.translations.map((translation) => ({
        ...translation,
        service: {
          icon: service.icon,
          iconColor: service.iconColor,
          sortOrder: service.sortOrder,
        },
      })),
    );
  }

  async findPublic(): Promise<PublicServiceResponse[]> {
    const services = await this.prisma.service.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        icon: true,
        iconColor: true,
        translations: {
          select: {
            language: true,
            title: true,
            description: true,
          },
        },
      },
    });

    return services.map((service) => {
      const kaTranslation = service.translations.find(
        (translation) => translation.language === Language.KA,
      );
      const enTranslation = service.translations.find(
        (translation) => translation.language === Language.EN,
      );

      return {
        id: service.id,
        title_ka: kaTranslation?.title,
        title_en: enTranslation?.title,
        description_ka: kaTranslation?.description,
        description_en: enTranslation?.description,
        icon: service.icon,
        iconColor: service.iconColor,
        colors: [],
      };
    });
  }

  async createTranslation(
    serviceId: string,
    createServiceTranslationDto: CreateServiceTranslationDto,
    adminId: string,
  ) {
    const service = await this.prisma.service.findFirst({
      where: {
        id: serviceId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const translation = await tx.serviceTranslation.create({
          data: {
            serviceId,
            language: createServiceTranslationDto.language,
            title: createServiceTranslationDto.title,
            description: createServiceTranslationDto.description,
          },
          include: {
            service: {
              select: {
                icon: true,
                iconColor: true,
                sortOrder: true,
              },
            },
          },
        });

        await tx.adminLog.create({
          data: {
            userId: adminId,
            action: AdminAction.UPDATE,
            entity: AdminEntity.SERVICE,
            entityId: serviceId,
          },
        });

        return translation;
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Service translation already exists for this language',
        );
      }

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

  async reorder(serviceIds: string[], adminId: string) {
    return this.prisma.$transaction(async (tx) => {
      const services = await tx.service.findMany({
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
        },
      });
      const existingServiceIds = services.map((service) => service.id);
      const existingServiceIdSet = new Set(existingServiceIds);
      const hasCompleteServiceSet =
        serviceIds.length === existingServiceIds.length &&
        serviceIds.every((serviceId) => existingServiceIdSet.has(serviceId));

      if (!hasCompleteServiceSet) {
        throw new BadRequestException(
          'serviceIds must include every current service exactly once',
        );
      }

      await Promise.all(
        serviceIds.map((serviceId, index) =>
          tx.service.update({
            where: {
              id: serviceId,
            },
            data: {
              sortOrder: index + 1,
            },
            select: {
              id: true,
            },
          }),
        ),
      );

      await tx.adminLog.create({
        data: {
          userId: adminId,
          action: AdminAction.UPDATE,
          entity: AdminEntity.SERVICE,
          entityId: serviceIds.join(','),
        },
      });

      return {
        serviceIds,
        message: 'Services reordered successfully',
      };
    });
  }

  async update(id: string, updateServiceDto: UpdateServiceDto, adminId: string) {
    if (!Object.keys(updateServiceDto).length) {
      throw new BadRequestException('No service fields provided for update');
    }

    const dto = updateServiceDto as unknown as Record<string, any>;
    const data: Record<string, any> = {};

    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;

    if (dto.icon !== undefined || dto.iconColor !== undefined) {
      data.service = { update: {} };
      if (dto.icon !== undefined) data.service.update.icon = dto.icon;
      if (dto.iconColor !== undefined)
        data.service.update.iconColor = dto.iconColor;
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const service = await tx.serviceTranslation.update({
          where: {
            id: id,
          },
          data: data as any,
        });

        await tx.adminLog.create({
          data: {
            userId: adminId,
            action: AdminAction.UPDATE,
            entity: AdminEntity.SERVICE,
            entityId: service.serviceId,
          },
        });

        return service;
      });
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string, adminId: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const service = await tx.service.delete({
          where: {
            id: id,
          },
          include: {
            translations: true,
          },
        });

        await tx.adminLog.create({
          data: {
            userId: adminId,
            action: AdminAction.DELETE,
            entity: AdminEntity.SERVICE,
            entityId: service.id,
          },
        });

        return { service, message: 'Service deleted successfully' };
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Service not found');
      }

      throw error;
    }
  }
}
