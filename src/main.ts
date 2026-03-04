import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
const { router } = require('bull-board')
const basicAuth = require('express-basic-auth')
require('dotenv').config();
import * as express from 'express';

import { AppModule } from './app.module';
import { VALIDATION_PIPE_OPTIONS } from './HeThong/auth/constants/role.constant';

// const basicAuth = require('express-basic-auth')
async function bootstrap() {
  // const server = express();
  const dirname = __dirname.replace('dist/', '')
  const app = await NestFactory.create<NestExpressApplication>(AppModule,);
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/upload/',
  });
  app.setGlobalPrefix('api/v1');

  app.use('/bull-dashboard/queues', basicAuth({
    users: {
      [process.env.BULL_DASHBOARD_USER]: process.env.BULL_DASHBOARD_PASSWORD,
    },
    challenge: true,
  }),
    router
  )

  app.useGlobalPipes(new ValidationPipe(VALIDATION_PIPE_OPTIONS));
  // app.use(RequestIdMiddleware);

  // Production-ready CORS configuration
  app.enableCors({
    origin: (origin, callback) => {
      // Always allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Production domains - Always allowed
      const productionDomains = [
        'https://cdhy.com.vn',
        'https://www.cdhy.com.vn',
        'https://api.cdhy.com.vn',  // API subdomain
        'https://zalo.me',
        'https://mini.zalo.me',
        'https://h5.zalo.me',
        'https://h5.zdn.vn',      // Zalo H5 platform
        'https://mini.zdn.vn',    // Zalo Mini App
        'https://zdn.vn',
        'https://cdhy.com.vn',
        'https://www.cdhy.com.vn',
        'https://api.cdhy.com.vn',  // API subdomain
      ];

      // Development patterns - For testing and development
      const developmentPatterns = [
        /^http:\/\/localhost:\d+$/,           // localhost any port
        /^http:\/\/127\.0\.0\.1:\d+$/,        // 127.0.0.1 any port  
        /^https?:\/\/103\.149\.29\.56(:\d+)?$/, // Server IP (for Swagger)
        /^https?:\/\/.*\.ngrok\.io$/,          // ngrok tunnels
        /^https?:\/\/.*\.vercel\.app$/,        // Vercel deployments
        /^https?:\/\/.*\.netlify\.app$/        // Netlify deployments
      ];

      // Zalo subdomain patterns
      const zaloPatterns = [
        /^https:\/\/.*\.zalo\.me$/,    // *.zalo.me
        /^https:\/\/.*\.zdn\.vn$/      // *.zdn.vn
      ];

      // LDBN subdomain patterns - Dynamic support for all subdomains
      const ldbnPatterns = [
        /^https:\/\/.*\.cdhy\.com\.vn$/  // *.cdhy.com.vn - Support any subdomain
      ];

      // Check production domains
      if (productionDomains.includes(origin)) {
        return callback(null, true);
      }

      // Check Zalo subdomains
      if (zaloPatterns.some(pattern => pattern.test(origin))) {
        return callback(null, true);
      }

      // Check LDBN subdomains - Dynamic support
      if (ldbnPatterns.some(pattern => pattern.test(origin))) {
        return callback(null, true);
      }

      // Check development patterns
      if (developmentPatterns.some(pattern => pattern.test(origin))) {
        return callback(null, true);
      }

      // Reject unknown origins
      console.log('❌ CORS: Rejecting origin:', origin);
      return callback(new Error('Not allowed by CORS'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Requested-With',
      'X-Request-ID'
    ],
    credentials: true,
    exposedHeaders: ['X-Request-ID']
  });
  app.use(express.static(join(__dirname, '..', 'public')));

  /** Swagger configuration*/
  const options = new DocumentBuilder()
    .setTitle('Nestjs API starter')
    .setDescription('Nestjs API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(process.env.APP_PORT);
}
bootstrap();
