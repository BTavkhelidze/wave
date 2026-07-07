import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { Logger, ValidationPipe } from '@nestjs/common';

import { SwaggerModule } from '@nestjs/swagger';
import { getCorsConfig } from './config/cors.config';
import { ConfigService } from '@nestjs/config';
import { getSwaggerConfig } from './config/swagger.config';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const logger = new Logger(AppModule.name);
  const apiPrefix = config.getOrThrow<string>('appConfig.apiPrefix');

  app.setGlobalPrefix(apiPrefix);

  app.enableCors(getCorsConfig(config));
  app.use(cookieParser());

  // Swagger setup
  const swaggerConfig = getSwaggerConfig();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup(`${apiPrefix}/docs`, app, swaggerDocument, {
    jsonDocumentUrl: 'openapi.json',
  });
  const port = config.getOrThrow<number>('appConfig.http.port');
  const host = config.getOrThrow<string>('appConfig.http.host');

  try {
    await app.listen(port, '0.0.0.0');

    Logger.log(`Server is running at: ${host}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Failed to start server: ${error.message}`, error);
    } else {
      logger.error('Failed to start server: unknown error', error as string);
    }
    process.exit(1);
  }
}
bootstrap();
