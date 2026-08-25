import type { INestApplication } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { getSwaggerConfig } from './swagger.config';

export function setupApiDocumentation(
  app: INestApplication,
  configService: ConfigService,
): void {
  const enabled = configService.getOrThrow<boolean>('appConfig.docs.enabled');

  if (!enabled) {
    return;
  }

  const apiPrefix = configService.getOrThrow<string>('appConfig.apiPrefix');
  const swaggerConfig = getSwaggerConfig();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup(`${apiPrefix}/docs`, app, swaggerDocument, {
    jsonDocumentUrl: `${apiPrefix}/openapi.json`,
  });
}
