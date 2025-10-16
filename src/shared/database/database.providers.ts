
// If you must keep custom providers, use this safe version:
import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';

export async function connectWithRetry(dataSource: DataSource, maxRetries = 3): Promise<void> {
  const logger = new Logger('DatabaseConnect');
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await dataSource.initialize();
      logger.log('✅ Database connected successfully');
      return;
    } catch (error) {
      logger.warn(`❌ Database connection attempt ${attempt} failed: ${error.message}`);
      
      if (attempt === maxRetries) {
        logger.error('❌ All database connection attempts failed');
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

// Remove patchQueryRunner as it can cause connection leaks










/*
import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';

// 🟢 Retry connection logic
export async function connectWithRetry(dataSource: DataSource, retries = 5, delay = 3000): Promise<void> {
  const logger = new Logger('DatabaseConnection');

  for (let i = 0; i < retries; i++) {
    try {
      await dataSource.initialize();
      logger.log('✅ Database connected successfully.');
      return;
    } catch (error) {
      logger.error(`❌ Database connection failed (attempt ${i + 1}/${retries}):`, error.message);
      if (i < retries - 1) {
        logger.log(`🔁 Retrying in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        logger.error('🚨 All connection attempts failed.');
        throw error;
      }
    }
  }
}

// 🧩 Optional: Add query logging or retry on transient errors
export function patchQueryRunner(dataSource: DataSource) {
  const logger = new Logger('QueryRunner');

  const originalQuery = dataSource.query.bind(dataSource);
  dataSource.query = async (...args: any[]) => {
    const [query] = args;
    const start = Date.now();
    try {
      const result = await originalQuery(...args);
      const duration = Date.now() - start;
      if (duration > 500) {
        logger.warn(`⏱️ Slow Query (${duration}ms): ${query}`);
      }
      return result;
    } catch (error) {
      logger.error(`❌ Query failed: ${query}`, error);
      throw error;
    }
  };
}
*/