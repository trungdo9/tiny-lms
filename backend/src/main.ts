import 'dotenv/config';
import { resolve } from 'path';
import { config } from 'dotenv';

config({ path: resolve(process.cwd(), '.env') });

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';
import * as path from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') || 3001;

  // Serve SCORM content as static files
  app.use(
    '/scorm/content',
    express.static(path.join(process.cwd(), 'public', 'scorm'), {
      index: false,
    }),
  );

  // Serve uploaded images
  app.use(
    '/uploads/images',
    express.static(path.join(process.cwd(), 'public', 'uploads', 'images'), {
      index: false,
    }),
  );

  // Enable CORS for frontend, including LAN/dev origins
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const isAllowed = [
        /^http:\/\/localhost(?::\d+)?$/,
        /^http:\/\/127\.0\.0\.1(?::\d+)?$/,
        /^http:\/\/192\.168\.\d+\.\d+(?::\d+)?$/,
        /^http:\/\/10\.\d+\.\d+\.\d+(?::\d+)?$/,
        /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+(?::\d+)?$/,
      ].some((pattern) => pattern.test(origin));

      callback(null, isAllowed);
    },
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Tiny LMS API')
      .setDescription('REST API for Tiny LMS — NestJS 11 backend')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
