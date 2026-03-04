import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@Injectable()
export class StaticFileMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Chỉ xử lý các request đến /uploads
    if (!req.url.startsWith('/uploads')) {
      return next();
    }

    const filePath = join(process.cwd(), req.url);

    if (existsSync(filePath)) {
      return res.sendFile(filePath);
    } else {
      return res.status(404).json({
        statusCode: 404,
        message: 'File không tồn tại'
      });
    }
  }
}
