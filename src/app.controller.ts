// app.controller.ts
import { Controller, Get, Head } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): { status: string; message: string; timestamp: string } {
    return this.appService.getHello();
  }

  // ✅ ADD THIS: Handle HEAD requests for health checks
  @Head()
  headCheck(): void {
    // HEAD requests should return empty response with 200 status
    return;
  }
}