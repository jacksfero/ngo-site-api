// health.controller.ts
import { Controller, Get, Head } from '@nestjs/common';

@Controller()
export class HealthController {
  
  @Get()
  healthCheck() {
    return {
      status: 'OK',
      service: 'Indiagalleria Backend API',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Head()
  headCheck() {
    // Empty response for HEAD requests (load balancers, health checks)
    return;
  }
}