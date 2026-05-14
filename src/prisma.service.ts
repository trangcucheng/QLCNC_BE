import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    super({
      log: ['warn', 'error'],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    await this.connectWithRetry();
    
    // Health check every 30 seconds
    setInterval(() => this.healthCheck(), 30000);
  }

  private async connectWithRetry() {
    while (this.reconnectAttempts < this.maxReconnectAttempts) {
      try {
        await this.$connect();
        this.logger.log('✅ Database connected successfully');
        this.reconnectAttempts = 0; // Reset on success
        return;
      } catch (error) {
        this.reconnectAttempts++;
        this.logger.error(
          `❌ Failed to connect to database (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
          error,
        );
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          throw new Error('Max database connection attempts reached');
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => 
          setTimeout(resolve, Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000))
        );
      }
    }
  }

  private async healthCheck() {
    try {
      await this.$queryRaw`SELECT 1`;
    } catch (error) {
      this.logger.warn('⚠️ Database health check failed, attempting reconnect...');
      try {
        await this.$disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
      await this.connectWithRetry();
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Database disconnected');
    } catch (error) {
      this.logger.error('Failed to disconnect from database', error);
    }
  }
}
