// src/app.service.ts
import { Injectable } from '@nestjs/common';

import { createReadStream, readFile, readFileSync } from 'node:fs';
import { join } from 'node:path';

@Injectable()
export class AppService {


  getHello() {




 

const filePath = join(process.cwd(), 'src/test.txt'); // Example file
     readFile(filePath,'utf8', (error,result) => {
      console.log(`"midlle 222222"`,result);
    });
   // return `Content of package.json: ${fileContent.substring(0, 100)}...`;

  

    return {
      status: 'OK',
      message: 'NGO MULTI SITE API is running successfully! 🚀',
      timestamp: new Date().toISOString(),
      service: 'NGO MULTI SITE Backend',
      environment: process.env.NODE_ENV || 'development',
      docs: 'https://your-docs-url.com', // Add your docs URL if available
    };
  }
}