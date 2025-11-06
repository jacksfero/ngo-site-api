import { Injectable,Logger, OnModuleInit, OnApplicationShutdown } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class DatabaseHealthService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(DatabaseHealthService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  onModuleInit() {
    this.logger.log('Database health service initialized');
  }

  // Monitor connection health every 5 minutes
  @Interval(300000)
  async checkConnectionHealth() {
    try {
      if (this.dataSource.isInitialized) {
        // Test the connection
        await this.dataSource.query('SELECT 1');
        
        // Check active connections
        const connections = await this.dataSource.query('SHOW PROCESSLIST');
        const activeConnections = connections.length;
        
        this.logger.debug(`Active database connections: ${activeConnections}`);
        
        if (activeConnections > 15) {
          this.logger.warn(`High number of database connections: ${activeConnections}`);
        }
      }
    } catch (error) {
      this.logger.error('Database health check failed', error.stack);
    }
  }

  async onApplicationShutdown() {
    this.logger.log('Cleaning up database health service');
    // Connection cleanup is handled by DatabaseModule
  }

  // Method to manually check connection status
  async getConnectionStatus() {
    try {
      if (!this.dataSource.isInitialized) {
        return { status: 'disconnected', connections: 0 };
      }

      await this.dataSource.query('SELECT 1');
      const connections = await this.dataSource.query('SHOW PROCESSLIST');
      
      return {
        status: 'connected',
        activeConnections: connections.length,
        isInitialized: this.dataSource.isInitialized,
      };
    } catch (error) {
      return {
        status: 'error n',
        error: error.message,
        isInitialized: this.dataSource.isInitialized,
      };
    }
  }
}