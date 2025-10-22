// src/app.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      status: 'OK',
      message: 'API is running successfully!',
      timestamp: new Date().toISOString(),
      service: 'Indiagalleria Backend',
    };
  }
}