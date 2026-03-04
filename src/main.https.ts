// main.ts - NestJS với HTTPS (đã đồng bộ)
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import { join } from 'path'; // nếu bạn cần serve uploads

import { AppModule } from './app.module';

async function bootstrap() {
  // Chỉ dùng nếu bạn thực sự chạy HTTPS trực tiếp ở Nest.
  // Nếu đã có Nginx TLS termination thì có thể bỏ httpsOptions.
  const httpsOptions =
    process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH
      ? {
        key: fs.readFileSync(process.env.SSL_KEY_PATH),
        cert: fs.readFileSync(process.env.SSL_CERT_PATH),
      }
      : undefined;

  const app = await NestFactory.create(AppModule, { httpsOptions });

  // GIỮ NGUYÊN như bản HTTP
  app.setGlobalPrefix('api/v1');

  // (tuỳ chọn) nếu có serve file tĩnh uploads giống file HTTP:
  // app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/upload/' });

  // CORS
  app.enableCors({
    origin: [
      'https://mini.zalo.me',
      'https://cdhy.com.vn',
      ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : []),
    ],
    credentials: true,
  });

  // Global validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // SWAGGER: LUÔN mount dưới /api/swagger và tôn trọng global prefix
  const config = new DocumentBuilder()
    .setTitle('QLCD API')
    .setDescription('API for Quản lý Công đoàn cơ sở')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: false, // paths sẽ là /api/v1/...
  });
  SwaggerModule.setup('api/swagger', app, document); // UI: /api/swagger, JSON: /api/swagger-json

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on ${httpsOptions ? 'https' : 'http'}://localhost:${port}`);
}

bootstrap();
