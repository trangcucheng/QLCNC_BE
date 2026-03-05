import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('RBAC API')
    .setDescription(
      'API for Role-Based Access Control with NestJS, Prisma, and PostgreSQL',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'access-token', // name of security scheme
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha', // 🔧 sắp xếp tags theo alphabet (nếu dùng @ApiTags)
      displayRequestDuration: true, // 🔧 hiển thị thời gian request
      filter: true, // 🔧 bật filter
    },
  });
  await app.listen(process.env.PORT ?? 5432);
  console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
  console.log(
    `📚 Swagger UI available at http://localhost:${process.env.PORT}/api`,
  );
}
bootstrap();
