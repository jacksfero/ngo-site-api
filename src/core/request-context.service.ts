// src/core/request-context.service.ts
import { Injectable, Scope, Inject } from '@nestjs/common';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  getRequest(): Request {
    return this.request;
  }

  getUser() {
    return this.request?.user;
  }

  getCookies() {
    return this.request?.cookies;
  }

  getHeader(name: string) {
    return this.request?.headers?.[name.toLowerCase()];
  }
}
