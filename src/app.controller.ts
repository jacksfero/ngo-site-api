// src/app.controller.ts
import { Controller, Get, Head } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  // ✅ Handle HEAD requests for health checks
  @Head()
  headCheck(): void {
    return; // Empty response for health checks
  }
}