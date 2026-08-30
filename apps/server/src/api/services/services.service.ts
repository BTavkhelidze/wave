import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { CreateServiceTranslationDto } from './dto/create-service-translation.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { AdminAction, AdminEntity, Language, Prisma } from '@prisma/client';
import { ServiceLanguage } from './enums/service-language';
import {
  DEFAULT_SERVICE_ANIMATION_COLORS,
  normalizeServiceAnimationColors,
} from './lib/service-animation-colors.util';
import { normalizeServiceSlug } from './lib/service-slug.util';

export interface PublicServiceResponse {
  id: string;
  title_ka?: string;
  title_en?: string;
  description_ka?: string;
  description_en?: string;
  slug_ka?: string;
  slug_en?: string;
  metaTitle_ka?: string;
  metaTitle_en?: string;
  metaDescription_ka?: string;
  metaDescription_en?: string;
  icon: string;
  iconColor: string;
  animationColors: string[];
}

export interface ServiceViewCountResponse {
  viewCount: number;
}

export interface ServicesAnalyticsResponse {
  services: {
    total: number;
    totalViews: number;
  };
  blogs: {
    total: number;
    totalViews: number;
  };
  totalServices: number;
  totalServiceViews: number;
  mostViewedService: {
    id: string;
    title: string;
    viewCount: number;
  } | null;
}

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async incrementViewCount(id: string): Promise<ServiceViewCountResponse> {
    try {
      const existingService = await this.prisma.service.findFirst({
        where: {
          id,
          isActive: true,
          deletedAt: null,
        },
        select: {
          id: true,
        },
      });

      if (!existingService) {
        throw new NotFoundException('Service not found');
      }

      const service = await this.prisma.service.update({
        where: {
          id: existingService.id,
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
      if (error instanceof HttpException) {
        throw error;
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Service not found');
      }

      this.logger.error(
        'Service view count increment failed',
        error instanceof Error ? error.stack : undefined,
      );

      throw new InternalServerErrorException(
        'Could not increment service view count',
      );
    }
  }

  async incrementPublicViewCountBySlug(
    slug: string,
  ): Promise<ServiceViewCountResponse> {
    const normalizedSlug = this.normalizeRequiredSlug(slug);

    try {
      const translation = await this.prisma.serviceTranslation.findFirst({
        where: {
          slug: normalizedSlug,
          service: {
            isActive: true,
            deletedAt: null,
          },
        },
        select: {
          serviceId: true,
        },
      });

      if (!translation) {
        throw new NotFoundException('Service not found');
      }

      const service = await this.prisma.service.update({
        where: {
          id: translation.serviceId,
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
      if (error instanceof HttpException) {
        throw error;
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Service not found');
      }

      this.logger.error(
        'Service public view count increment failed',
        error instanceof Error ? error.stack : undefined,
      );

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

    const translations = createServiceDto.translations.map((translation) => ({
      ...translation,
      slug: this.normalizeRequiredSlug(translation.slug),
      metaTitle: this.normalizeOptionalText(translation.metaTitle),
      metaDescription: this.normalizeOptionalText(translation.metaDescription),
    }));

    try {
      return await this.prisma.$transaction(async (tx) => {
        const serviceCount = await tx.service.count({
          where: {
            deletedAt: null,
          },
        });
        const service = await tx.service.create({
          data: {
            icon: createServiceDto.icon,
            iconColor: createServiceDto.iconColor,
            animationColors: normalizeServiceAnimationColors(
              createServiceDto.animationColors ?? [
                ...DEFAULT_SERVICE_ANIMATION_COLORS,
              ],
            ),
            sortOrder: serviceCount + 1,
            translations: {
              create: translations.map((translation) => ({
                language: translation.language,
                title: translation.title,
                description: translation.description,
                slug: translation.slug,
                metaTitle: translation.metaTitle,
                metaDescription: translation.metaDescription,
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
    } catch (error: unknown) {
      this.throwServiceSlugConflict(error);

      throw error;
    }
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
        animationColors: true,
        sortOrder: true,
        viewCount: true,
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
          animationColors: service.animationColors,
          sortOrder: service.sortOrder,
        },
        viewCount: service.viewCount,
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
        animationColors: true,
        translations: {
          select: {
            language: true,
            title: true,
            description: true,
            slug: true,
            metaTitle: true,
            metaDescription: true,
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
        slug_ka: kaTranslation?.slug,
        slug_en: enTranslation?.slug,
        metaTitle_ka: kaTranslation?.metaTitle ?? undefined,
        metaTitle_en: enTranslation?.metaTitle ?? undefined,
        metaDescription_ka: kaTranslation?.metaDescription ?? undefined,
        metaDescription_en: enTranslation?.metaDescription ?? undefined,
        icon: service.icon,
        iconColor: service.iconColor,
        animationColors: service.animationColors,
      };
    });
  }

  async getAnalytics(): Promise<ServicesAnalyticsResponse> {
    const [
      totalServices,
      serviceViewCountAggregate,
      totalBlogs,
      blogViewCountAggregate,
      mostViewedService,
    ] = await Promise.all([
      this.prisma.service.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prisma.service.aggregate({
        where: {
          deletedAt: null,
        },
        _sum: {
          viewCount: true,
        },
      }),
      this.prisma.blog.count(),
      this.prisma.blog.aggregate({
        _sum: {
          viewCount: true,
        },
      }),
      this.prisma.service.findFirst({
        where: {
          deletedAt: null,
        },
        orderBy: [
          {
            viewCount: 'desc',
          },
          {
            sortOrder: 'asc',
          },
          {
            createdAt: 'asc',
          },
          {
            id: 'asc',
          },
        ],
        select: {
          id: true,
          viewCount: true,
          translations: {
            where: {
              language: Language.EN,
            },
            take: 1,
            select: {
              title: true,
            },
          },
        },
      }),
    ]);
    const totalServiceViews = serviceViewCountAggregate._sum.viewCount ?? 0;
    const totalBlogViews = blogViewCountAggregate._sum.viewCount ?? 0;

    return {
      services: {
        total: totalServices,
        totalViews: totalServiceViews,
      },
      blogs: {
        total: totalBlogs,
        totalViews: totalBlogViews,
      },
      totalServices,
      totalServiceViews,
      mostViewedService: mostViewedService
        ? {
            id: mostViewedService.id,
            title:
              mostViewedService.translations[0]?.title ?? 'Untitled service',
            viewCount: mostViewedService.viewCount,
          }
        : null,
    };
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
            slug: this.normalizeRequiredSlug(createServiceTranslationDto.slug),
            metaTitle: this.normalizeOptionalText(
              createServiceTranslationDto.metaTitle,
            ),
            metaDescription: this.normalizeOptionalText(
              createServiceTranslationDto.metaDescription,
            ),
          },
          include: {
            service: {
              select: {
                icon: true,
                iconColor: true,
                animationColors: true,
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
        this.throwServiceSlugConflict(error);

        throw new ConflictException(
          'Service translation already exists for this language',
        );
      }

      throw error;
    }
  }

  async findOne(id: string) {
    return this.prisma.serviceTranslation.findFirst({
      where: {
        id,
        service: {
          deletedAt: null,
        },
      },
      include: {
        service: {
          select: {
            icon: true,
            iconColor: true,
            animationColors: true,
            sortOrder: true,
          },
        },
      },
    });
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

  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
    adminId: string,
  ) {
    if (!Object.keys(updateServiceDto).length) {
      throw new BadRequestException('No service fields provided for update');
    }

    const data: Prisma.ServiceTranslationUpdateInput = {};

    if (updateServiceDto.title !== undefined)
      data.title = updateServiceDto.title;
    if (updateServiceDto.description !== undefined) {
      data.description = updateServiceDto.description;
    }
    if (updateServiceDto.slug !== undefined) {
      data.slug = this.normalizeRequiredSlug(updateServiceDto.slug);
    }
    if (updateServiceDto.metaTitle !== undefined) {
      data.metaTitle = this.normalizeOptionalText(updateServiceDto.metaTitle);
    }
    if (updateServiceDto.metaDescription !== undefined) {
      data.metaDescription = this.normalizeOptionalText(
        updateServiceDto.metaDescription,
      );
    }

    if (
      updateServiceDto.icon !== undefined ||
      updateServiceDto.iconColor !== undefined ||
      updateServiceDto.animationColors !== undefined
    ) {
      const serviceUpdate: Prisma.ServiceUpdateWithoutTranslationsInput = {};

      if (updateServiceDto.icon !== undefined) {
        serviceUpdate.icon = updateServiceDto.icon;
      }
      if (updateServiceDto.iconColor !== undefined) {
        serviceUpdate.iconColor = updateServiceDto.iconColor;
      }
      if (updateServiceDto.animationColors !== undefined) {
        serviceUpdate.animationColors = normalizeServiceAnimationColors(
          updateServiceDto.animationColors,
        );
      }

      data.service = { update: serviceUpdate };
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const existingTranslation = await tx.serviceTranslation.findFirst({
          where: {
            id,
            service: {
              deletedAt: null,
            },
          },
          select: {
            id: true,
          },
        });

        if (!existingTranslation) {
          throw new NotFoundException('Service not found');
        }

        const service = await tx.serviceTranslation.update({
          where: {
            id: existingTranslation.id,
          },
          data,
          include: {
            service: {
              select: {
                icon: true,
                iconColor: true,
                animationColors: true,
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
            entityId: service.serviceId,
          },
        });

        return service;
      });
    } catch (error: unknown) {
      this.throwServiceSlugConflict(error);

      throw error;
    }
  }

  async remove(id: string, adminId: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const existingService = await tx.service.findFirst({
          where: {
            id,
            deletedAt: null,
          },
          select: {
            id: true,
          },
        });

        if (!existingService) {
          throw new NotFoundException('Service not found');
        }

        const service = await tx.service.update({
          where: {
            id: existingService.id,
          },
          data: {
            deletedAt: new Date(),
            isActive: false,
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

  private normalizeRequiredSlug(slug: string): string {
    const normalizedSlug = normalizeServiceSlug(slug);

    if (!normalizedSlug) {
      throw new BadRequestException('Service slug is required');
    }

    return normalizedSlug;
  }

  private normalizeOptionalText(value: string | undefined): string | null {
    if (value === undefined) {
      return null;
    }

    const normalizedValue = value.trim();

    return normalizedValue.length > 0 ? normalizedValue : null;
  }

  private throwServiceSlugConflict(error: unknown): never | void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002' &&
      this.isServiceSlugConstraint(error.meta?.target)
    ) {
      throw new ConflictException(
        'A service with this slug already exists for the selected language',
      );
    }
  }

  private isServiceSlugConstraint(target: unknown): boolean {
    if (typeof target === 'string') {
      return target.includes('language') && target.includes('slug');
    }

    return (
      Array.isArray(target) &&
      target.includes('language') &&
      target.includes('slug')
    );
  }
}
