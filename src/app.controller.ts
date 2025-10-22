import { Controller, Get, Head } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // For local health check
  @Get()
  getRoot() {
    return this.appService.getHello();
  }

  @Head()
  headRoot() {
    return;
  }

  // For API prefix health check
  @Get('api')
  getApiHello() {
    return this.appService.getHello();
  }

  @Head('api')
  headApi() {
    return;
  }
}
