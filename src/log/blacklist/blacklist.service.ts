import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class BlacklistService {
  constructor(private prisma: PrismaService) {}

  async isBlacklisted(token: string) {
    return await this.prisma.danhSachDen.findFirst({
      where: { token },
    });
  }

  async add(token: string, hetHan: Date) {
    return await this.prisma.danhSachDen.create({
      data: { token, hetHan },
    });
  }
}
