import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { ValidationPipe} from '@nestjs/common'

import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )

  // Swagger setup
  const config = new DocumentBuilder()
  .setTitle('Nest Wave API')
  .setDescription('API documentation for Nest Wave engineering')
  .setTermsOfService('https://example.com/terms')
  .setLicense('MIT', 'https://opensource.org/licenses/MIT')
  .addServer('http://localhost:3000', 'Local development server')
  .setVersion('1.0')
  .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
