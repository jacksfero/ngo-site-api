// app.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { status: string; message: string; timestamp: string } {
    return {
      status: 'OK',
      message: 'Indiagalleria API is running!',
      timestamp: new Date().toISOString(),
    };
  }
}