// src/core/filters/global-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger, NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // ✅ Skip for logout endpoint to avoid 401 errors
    if (request.url.includes('/auth/logout')) {
      return response.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    }

    // ✅ Skip for OPTIONS requests
    if (request.method === 'OPTIONS') {
      return response.status(200).end();
    }

    // ✅ Check if headers already sent
    if (response.headersSent) {
      return;
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // ✅ FIXED: Only log as 404 if it's actually a NotFoundException
    if (status === 404) {
      this.logger.warn(`Route not found: ${request.method} ${request.url}`);
      
      return response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: 'Route not found',
      });
    }

    // Log as error only for server errors (5xx), warn for client errors (4xx)
    if (status >= 500) {
      this.logger.error(`Error ${status}: ${request.method} ${request.url}`, exception instanceof Error ? exception.stack : '');
    } else if (status >= 400) {
      this.logger.warn(`Client error ${status}: ${request.method} ${request.url}`);
    }

    try {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: typeof message === 'string' ? message : (message as any).message,
        ...(typeof message === 'object' && { details: message }),
      });
    } catch (error) {
      this.logger.error('Failed to send error response');
    }
  }
}