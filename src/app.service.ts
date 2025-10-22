// src/app.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      status: 'OK',
      message: 'Indiagalleria API is running successfully! 🚀',
      timestamp: new Date().toISOString(),
      service: 'Indiagalleria Backend',
      environment: process.env.NODE_ENV || 'development',
      docs: 'https://your-docs-url.com', // Add your docs URL if available
    };
  }
}