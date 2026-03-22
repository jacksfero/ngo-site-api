/*import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SitesService } from '../sites/sites.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {

  constructor(private readonly sitesService: SitesService) {}

  async use(req: Request, res: Response, next: NextFunction) {

    const domain = req.headers.host;

    if (!domain) {
      return res.status(400).json({ message: 'Domain not found' });
    }

    const site = await this.sitesService.findByDomain(domain);

    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }

    req['site'] = site;

    next();
  }
}


app.module.ts

import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TenantMiddleware } from './middleware/tenant.middleware';

@Module({
  imports: [],
})
export class AppModule {

  configure(consumer: MiddlewareConsumer) {

    consumer
      .apply(TenantMiddleware)
      .forRoutes('*');

  }
}*/